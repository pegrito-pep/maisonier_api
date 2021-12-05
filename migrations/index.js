const Umzug = require('umzug')

module.exports = (sequelize) => {
    const umzug = new Umzug({
        migrations: {
            // indicates the folder containing the migration .js files
            path: `${__dirname}/../migrations`,
            pattern: /^\d+[\w-]+\.js$/,
            // inject sequelize's QueryInterface in the migrations
            params: [
                sequelize.getQueryInterface(), // queryInterface
                sequelize.constructor, // DataTypes
                function() {
                    throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
                }
            ]
        },
        // indicates that the migration data should be store in the database
        // itself through sequelize. The default configuration creates a table
        // named `SequelizeMeta`.
        storage: 'sequelize',
        storageOptions: {
            sequelize,
            modelName: '_migrations',
        },
        logging: function() {
            console.log.apply(null, arguments);
        }
    })

    /**
     * Execute les migrations
     */
    exports.up = async() => {
        // checks migrations and run them if they are not already applied
        await umzug.up()
        console.log('All migrations performed successfully')
    }

    return this
}