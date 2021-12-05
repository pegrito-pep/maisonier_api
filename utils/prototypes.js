/**
 * Ajoute des jours a la date
 * 
 * @param {Integer} days 
 * @return {Date}
 */
Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf())
    date.setDate(date.getDate() + days)

    return date
}