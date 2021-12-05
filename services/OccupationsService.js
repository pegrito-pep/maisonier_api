const dayjs = require("dayjs");

exports.calcul_impayes = (occupation, type, thisMonth) => {
    let total = 0;
    
    if (type == 'loyer') {
        occupation.loyers.forEach(elt => {
            if (thisMonth === true) {
                if (dayjs(elt.periode).format('YYYY-MM') == dayjs().format('YYYY-MM')) {
                    total += elt.montant - elt.montantPayer    
                }
            }
            else {
                total += elt.montant - elt.montantPayer
            }
        })
    }
    else if (type == 'charges') {
        occupation.charges.forEach(elt => {
            if (thisMonth === true) {
                if (dayjs(elt.periode).format('YYYY-MM') == dayjs().format('YYYY-MM')) {
                    total += elt.montant - elt.montantPayer    
                }
            }
            else {
                total += elt.montant - elt.montantPayer
            }
        })
    }
    else if (type == 'total') {
        ['loyer', 'eau', 'energie', 'charges'].forEach(elt => {
            total += exports.calcul_impayes(occupation, elt, thisMonth)
        })
    }
    else {
        exports.indexes_type(occupation, type, thisMonth).forEach(elt => {
            elt.avance = parseInt(elt.avance || 0)
            total += exports.calcul_consommation_indexe(occupation, elt, type) - elt.avance
        });
    }
    return total
}

exports.indexes_type = (occupation, type, thisMonth) => {
    if (thisMonth === true) {
        return occupation.indexes.filter(elt => elt.typeIndexe == type && dayjs(elt.periode).format('YYYY-MM') == dayjs().format('YYYY-MM'))    
    }
    return occupation.indexes.filter(elt => elt.typeIndexe == type)
}

exports.calcul_consommation_indexe = (occupation, indexe, type) => {
    let mode = occupation.modeEau, 
        pu = occupation.puEau,
        consommation = 1
        
    if (type == 'energie') {
        mode = occupation.modeEnergie
        pu = occupation.puEnergie
    }

    if (mode == 'index') {
        consommation = indexe.nouveau - indexe.ancien
    }

    return consommation * pu
}
