const db = require('../models')

/**
 * Liste de tous les types de charges
 */
exports.typesCharges = async(req, res) => {
    const typesCharges = await db.TypesCharges.findAll()

    return res.success(res.translate('types_de_charges'), typesCharges)
}