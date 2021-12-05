-- --------------------------------------------------------
-- Hôte :                        localhost
-- Version du serveur:           5.7.24 - MySQL Community Server (GPL)
-- SE du serveur:                Win64
-- HeidiSQL Version:             10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Listage de la structure de la base pour fs_lemaisonier
DROP DATABASE IF EXISTS `fs_lemaisonier`;
CREATE DATABASE IF NOT EXISTS `fs_lemaisonier` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `fs_lemaisonier`;

-- Listage de la structure de la table fs_lemaisonier. adresses
DROP TABLE IF EXISTS `adresses`;
CREATE TABLE IF NOT EXISTS `adresses` (
  `idLogement` int(11) NOT NULL,
  `pays` varchar(255) NOT NULL,
  `ville` varchar(255) NOT NULL,
  `quartier` varchar(255) NOT NULL,
  `lon` varchar(255) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idLogement`),
  CONSTRAINT `adresses_ibfk_1` FOREIGN KEY (`idLogement`) REFERENCES `logements` (`idLogement`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.adresses : ~1 rows (environ)
/*!40000 ALTER TABLE `adresses` DISABLE KEYS */;
INSERT INTO `adresses` (`idLogement`, `pays`, `ville`, `quartier`, `lon`, `lat`) VALUES
	(2, 'Cameroun', 'Yaounde', 'Mvan', '', ''),
	(10, 'Cameroun', 'Yaounde', 'Mvan', '', '');
/*!40000 ALTER TABLE `adresses` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. annonces
DROP TABLE IF EXISTS `annonces`;
CREATE TABLE IF NOT EXISTS `annonces` (
  `idAnnonce` int(11) NOT NULL AUTO_INCREMENT,
  `titreAnnonce` varchar(255) NOT NULL,
  `descAnnonce` varchar(255) NOT NULL,
  `etatAnnonce` tinyint(1) DEFAULT '1',
  `tags` varchar(255) DEFAULT NULL,
  `dateFin` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `idLogement` int(11) NOT NULL,
  PRIMARY KEY (`idAnnonce`),
  KEY `idLogement` (`idLogement`),
  CONSTRAINT `annonces_ibfk_1` FOREIGN KEY (`idLogement`) REFERENCES `logements` (`idLogement`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.annonces : ~0 rows (environ)
/*!40000 ALTER TABLE `annonces` DISABLE KEYS */;
/*!40000 ALTER TABLE `annonces` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. articles
DROP TABLE IF EXISTS `articles`;
CREATE TABLE IF NOT EXISTS `articles` (
  `idArticle` int(11) NOT NULL AUTO_INCREMENT,
  `titreArticle` varchar(255) NOT NULL,
  `numArticle` int(11) NOT NULL,
  PRIMARY KEY (`idArticle`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.articles : ~0 rows (environ)
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` (`idArticle`, `titreArticle`, `numArticle`) VALUES
	(2, 'Reglements general', 1);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. batiments
DROP TABLE IF EXISTS `batiments`;
CREATE TABLE IF NOT EXISTS `batiments` (
  `idBatiment` int(11) NOT NULL AUTO_INCREMENT,
  `idCite` int(11) NOT NULL,
  `nomBatiment` varchar(255) NOT NULL,
  `refBatiment` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idBatiment`),
  KEY `idCite` (`idCite`),
  CONSTRAINT `batiments_ibfk_1` FOREIGN KEY (`idCite`) REFERENCES `cites` (`idCite`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.batiments : ~0 rows (environ)
/*!40000 ALTER TABLE `batiments` DISABLE KEYS */;
INSERT INTO `batiments` (`idBatiment`, `idCite`, `nomBatiment`, `refBatiment`, `createdAt`, `updatedAt`) VALUES
	(2, 2, 'Batiment B', 'B1', '2021-04-01 15:39:45', '2021-04-01 15:40:52');
/*!40000 ALTER TABLE `batiments` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. caracteristiqueslogements
DROP TABLE IF EXISTS `caracteristiqueslogements`;
CREATE TABLE IF NOT EXISTS `caracteristiqueslogements` (
  `idLogement` int(11) NOT NULL,
  `libelleCaracteristique` varchar(255) NOT NULL,
  `valeur` varchar(255) NOT NULL,
  PRIMARY KEY (`idLogement`),
  CONSTRAINT `caracteristiqueslogements_ibfk_1` FOREIGN KEY (`idLogement`) REFERENCES `logements` (`idLogement`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.caracteristiqueslogements : ~1 rows (environ)
/*!40000 ALTER TABLE `caracteristiqueslogements` DISABLE KEYS */;
INSERT INTO `caracteristiqueslogements` (`idLogement`, `libelleCaracteristique`, `valeur`) VALUES
	(2, 'chambre', '3'),
	(10, 'chambre', '3');
/*!40000 ALTER TABLE `caracteristiqueslogements` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. cites
DROP TABLE IF EXISTS `cites`;
CREATE TABLE IF NOT EXISTS `cites` (
  `idCite` int(11) NOT NULL AUTO_INCREMENT,
  `idUtilisateur` int(11) DEFAULT NULL,
  `idEntreprise` int(11) DEFAULT NULL,
  `nomCite` varchar(255) NOT NULL,
  `refCite` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idCite`),
  KEY `FK_cites_utilisateurs` (`idUtilisateur`),
  KEY `FK_cites_entreprises` (`idEntreprise`),
  CONSTRAINT `FK_cites_entreprises` FOREIGN KEY (`idEntreprise`) REFERENCES `entreprises` (`idEntreprise`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_cites_utilisateurs` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.cites : ~2 rows (environ)
/*!40000 ALTER TABLE `cites` DISABLE KEYS */;
INSERT INTO `cites` (`idCite`, `idUtilisateur`, `idEntreprise`, `nomCite`, `refCite`, `createdAt`, `updatedAt`) VALUES
	(2, 16, NULL, 'Gloria City', '145wsA', '2021-04-01 14:21:06', '2021-04-01 15:38:52'),
	(3, 16, NULL, 'Invigia', '145wsA', '2021-04-02 09:20:20', '2021-04-02 09:20:20');
/*!40000 ALTER TABLE `cites` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. comptes
DROP TABLE IF EXISTS `comptes`;
CREATE TABLE IF NOT EXISTS `comptes` (
  `idCompte` int(11) NOT NULL AUTO_INCREMENT,
  `idUtilisateur` int(11) NOT NULL,
  `typeCompte` varchar(255) NOT NULL,
  `solde` int(11) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idCompte`),
  KEY `idUtilisateur` (`idUtilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.comptes : ~8 rows (environ)
/*!40000 ALTER TABLE `comptes` DISABLE KEYS */;
INSERT INTO `comptes` (`idCompte`, `idUtilisateur`, `typeCompte`, `solde`, `createdAt`, `updatedAt`) VALUES
	(6, 16, 'loyer', 0, '2021-03-31 17:55:15', '2021-03-31 17:55:15'),
	(7, 16, 'principal', 0, '2021-03-31 17:55:15', '2021-03-31 17:55:15'),
	(8, 17, 'loyer', 0, '2021-04-05 09:04:57', '2021-04-05 09:04:57'),
	(9, 17, 'principal', 0, '2021-04-05 09:04:57', '2021-04-05 09:04:57'),
	(16, 21, 'loyer', 0, '2021-04-06 14:37:48', '2021-04-06 14:37:48'),
	(17, 21, 'principal', 0, '2021-04-06 14:37:48', '2021-04-06 14:37:48');
/*!40000 ALTER TABLE `comptes` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. entreprises
DROP TABLE IF EXISTS `entreprises`;
CREATE TABLE IF NOT EXISTS `entreprises` (
  `idEntreprise` int(11) NOT NULL AUTO_INCREMENT,
  `registreCommerce` varchar(255) NOT NULL,
  `raisonSocile` varchar(255) NOT NULL,
  `siegeSocial` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `dateCreation` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idEntreprise`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.entreprises : ~0 rows (environ)
/*!40000 ALTER TABLE `entreprises` DISABLE KEYS */;
/*!40000 ALTER TABLE `entreprises` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. indexes
DROP TABLE IF EXISTS `indexes`;
CREATE TABLE IF NOT EXISTS `indexes` (
  `idIndexe` int(11) NOT NULL AUTO_INCREMENT,
  `typeIndexe` varchar(50) NOT NULL DEFAULT '',
  `ancien` int(11) NOT NULL,
  `nouveau` int(11) NOT NULL,
  `periode` date DEFAULT NULL,
  `avance` int(11) DEFAULT NULL,
  `reste` int(11) DEFAULT NULL,
  `datePaiement` datetime DEFAULT NULL,
  `idLogement` int(11) NOT NULL,
  PRIMARY KEY (`idIndexe`),
  KEY `idLogement` (`idLogement`),
  CONSTRAINT `indexes_ibfk_1` FOREIGN KEY (`idLogement`) REFERENCES `logements` (`idLogement`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.indexes : ~2 rows (environ)
/*!40000 ALTER TABLE `indexes` DISABLE KEYS */;
INSERT INTO `indexes` (`idIndexe`, `typeIndexe`, `ancien`, `nouveau`, `periode`, `avance`, `reste`, `datePaiement`, `idLogement`) VALUES
	(1, 'eau', 0, 0, '2021-04-02', 3000, 0, '2021-04-02 13:34:22', 2),
	(2, 'eau', 0, 12, '2021-04-02', NULL, NULL, NULL, 2),
	(3, 'eau', 12, 12, '2021-04-02', NULL, NULL, NULL, 2);
/*!40000 ALTER TABLE `indexes` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. logements
DROP TABLE IF EXISTS `logements`;
CREATE TABLE IF NOT EXISTS `logements` (
  `idLogement` int(11) NOT NULL AUTO_INCREMENT,
  `idUtilisateur` int(11) DEFAULT NULL,
  `idEntreprise` int(11) DEFAULT NULL,
  `idSousType` int(11) NOT NULL,
  `idBatiment` int(11) DEFAULT NULL,
  `idModele` int(11) DEFAULT NULL,
  `refLogement` varchar(255) NOT NULL,
  `nomLogement` varchar(255) NOT NULL,
  `descLogement` varchar(255) DEFAULT NULL,
  `prixMin` int(11) NOT NULL,
  `prixMax` int(11) NOT NULL,
  `etatLogement` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idLogement`),
  KEY `idEntreprise` (`idEntreprise`),
  KEY `logements_ibfk_3` (`idBatiment`),
  KEY `logements_ibfk_1` (`idUtilisateur`),
  KEY `logements_ibfk_2` (`idSousType`),
  KEY `logements_ibfk_5` (`idModele`),
  CONSTRAINT `logements_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `logements_ibfk_2` FOREIGN KEY (`idSousType`) REFERENCES `soustypeslogements` (`idSousType`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `logements_ibfk_3` FOREIGN KEY (`idBatiment`) REFERENCES `batiments` (`idBatiment`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `logements_ibfk_4` FOREIGN KEY (`idEntreprise`) REFERENCES `entreprises` (`idEntreprise`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `logements_ibfk_5` FOREIGN KEY (`idModele`) REFERENCES `modelescontrats` (`idModele`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.logements : ~3 rows (environ)
/*!40000 ALTER TABLE `logements` DISABLE KEYS */;
INSERT INTO `logements` (`idLogement`, `idUtilisateur`, `idEntreprise`, `idSousType`, `idBatiment`, `idModele`, `refLogement`, `nomLogement`, `descLogement`, `prixMin`, `prixMax`, `etatLogement`, `createdAt`, `updatedAt`) VALUES
	(2, 16, NULL, 1, NULL, NULL, 'B3', 'Loft', '', 5000, 13000, 1, '2021-04-01 09:42:41', '2021-04-03 09:03:52'),
	(5, 16, NULL, 1, NULL, NULL, 'S4', 'Suite', '', 5000, 13000, 0, '2021-04-02 09:26:41', '2021-04-02 09:26:41'),
	(10, 16, NULL, 1, 2, NULL, 'S4', 'Anacondaire', '', 5000, 13000, 0, '2021-04-02 09:58:25', '2021-04-02 09:58:25');
/*!40000 ALTER TABLE `logements` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. loyers
DROP TABLE IF EXISTS `loyers`;
CREATE TABLE IF NOT EXISTS `loyers` (
  `idOccupation` int(11) NOT NULL,
  `montantPayer` int(11) NOT NULL,
  `datePaiement` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idOccupation`),
  CONSTRAINT `loyers_ibfk_1` FOREIGN KEY (`idOccupation`) REFERENCES `occupations` (`idOccupation`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.loyers : ~0 rows (environ)
/*!40000 ALTER TABLE `loyers` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyers` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. modelescontrats
DROP TABLE IF EXISTS `modelescontrats`;
CREATE TABLE IF NOT EXISTS `modelescontrats` (
  `idModele` int(11) NOT NULL AUTO_INCREMENT,
  `libelleModele` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idModele`),
  CONSTRAINT `modelescontrats_ibfk_1` FOREIGN KEY (`idModele`) REFERENCES `logements` (`idLogement`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.modelescontrats : ~0 rows (environ)
/*!40000 ALTER TABLE `modelescontrats` DISABLE KEYS */;
/*!40000 ALTER TABLE `modelescontrats` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. occupations
DROP TABLE IF EXISTS `occupations`;
CREATE TABLE IF NOT EXISTS `occupations` (
  `idOccupation` int(11) NOT NULL AUTO_INCREMENT,
  `loyerBase` int(11) NOT NULL,
  `modePaiement` varchar(255) NOT NULL,
  `dateDeb` datetime DEFAULT NULL,
  `dateFin` datetime DEFAULT NULL,
  `modeEnergie` enum('forfait','index') NOT NULL,
  `modeEau` enum('forfait','index') NOT NULL,
  `puEnergie` int(11) NOT NULL,
  `puEau` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `idLogement` int(11) NOT NULL,
  `idUtilisateur` int(11) NOT NULL,
  PRIMARY KEY (`idOccupation`),
  KEY `idLogement` (`idLogement`),
  KEY `idUtilisateur` (`idUtilisateur`),
  CONSTRAINT `occupations_ibfk_1` FOREIGN KEY (`idLogement`) REFERENCES `logements` (`idLogement`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `occupations_ibfk_2` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.occupations : ~0 rows (environ)
/*!40000 ALTER TABLE `occupations` DISABLE KEYS */;
INSERT INTO `occupations` (`idOccupation`, `loyerBase`, `modePaiement`, `dateDeb`, `dateFin`, `modeEnergie`, `modeEau`, `puEnergie`, `puEau`, `createdAt`, `idLogement`, `idUtilisateur`) VALUES
	(5, 12000, 'prepayer', '2021-04-03 09:03:52', NULL, 'index', 'index', 100, 400, '2021-04-03 09:03:52', 2, 9);
/*!40000 ALTER TABLE `occupations` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. photos
DROP TABLE IF EXISTS `photos`;
CREATE TABLE IF NOT EXISTS `photos` (
  `idPhoto` int(11) NOT NULL AUTO_INCREMENT,
  `image` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `idLogement` int(11) NOT NULL,
  PRIMARY KEY (`idPhoto`),
  KEY `idLogement` (`idLogement`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`idLogement`) REFERENCES `logements` (`idLogement`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.photos : ~4 rows (environ)
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` (`idPhoto`, `image`, `createdAt`, `updatedAt`, `idLogement`) VALUES
	(1, 'photo1.jpeg', '2021-04-01 09:42:41', '2021-04-01 09:42:41', 2),
	(2, 'photo2.jpeg', '2021-04-01 09:42:41', '2021-04-01 09:42:41', 2),
	(7, 'photo1.jpeg', '2021-04-02 09:58:25', '2021-04-02 09:58:25', 10),
	(8, 'photo2.jpeg', '2021-04-02 09:58:25', '2021-04-02 09:58:25', 10);
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idUtilisateur` int(11) DEFAULT NULL,
  `idEntreprise` int(11) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idUtilisateur` (`idUtilisateur`),
  KEY `idEntreprise` (`idEntreprise`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`),
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`idEntreprise`) REFERENCES `entreprises` (`idEntreprise`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.roles : ~0 rows (environ)
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. rubriques
DROP TABLE IF EXISTS `rubriques`;
CREATE TABLE IF NOT EXISTS `rubriques` (
  `idRubrique` int(11) NOT NULL AUTO_INCREMENT,
  `titreRubrique` varchar(255) NOT NULL,
  `descRubrique` text,
  `idArticle` int(11) NOT NULL,
  PRIMARY KEY (`idRubrique`),
  KEY `idArticle` (`idArticle`),
  CONSTRAINT `rubriques_ibfk_1` FOREIGN KEY (`idArticle`) REFERENCES `articles` (`idArticle`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.rubriques : ~0 rows (environ)
/*!40000 ALTER TABLE `rubriques` DISABLE KEYS */;
INSERT INTO `rubriques` (`idRubrique`, `titreRubrique`, `descRubrique`, `idArticle`) VALUES
	(1, 'Utilisation des lieux', 'test de fonctionnalités', 2);
/*!40000 ALTER TABLE `rubriques` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. soustypeslogements
DROP TABLE IF EXISTS `soustypeslogements`;
CREATE TABLE IF NOT EXISTS `soustypeslogements` (
  `idSousType` int(11) NOT NULL AUTO_INCREMENT,
  `idType` int(11) NOT NULL,
  `libelleSousType` varchar(255) NOT NULL,
  `descSousType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idSousType`),
  KEY `idType` (`idType`),
  CONSTRAINT `soustypeslogements_ibfk_1` FOREIGN KEY (`idType`) REFERENCES `typeslogements` (`idType`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.soustypeslogements : ~0 rows (environ)
/*!40000 ALTER TABLE `soustypeslogements` DISABLE KEYS */;
INSERT INTO `soustypeslogements` (`idSousType`, `idType`, `libelleSousType`, `descSousType`, `createdAt`, `updatedAt`) VALUES
	(1, 1, 'Appartements moderne', 'test', '2021-04-01 08:16:34', '2021-04-02 09:06:04');
/*!40000 ALTER TABLE `soustypeslogements` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. typeslogements
DROP TABLE IF EXISTS `typeslogements`;
CREATE TABLE IF NOT EXISTS `typeslogements` (
  `idType` int(11) NOT NULL AUTO_INCREMENT,
  `libelleType` varchar(255) NOT NULL,
  `descType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idType`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.typeslogements : ~2 rows (environ)
/*!40000 ALTER TABLE `typeslogements` DISABLE KEYS */;
INSERT INTO `typeslogements` (`idType`, `libelleType`, `descType`, `createdAt`, `updatedAt`) VALUES
	(1, 'Appartements', 'test', '2021-04-01 08:15:12', '2021-04-02 09:01:52');
/*!40000 ALTER TABLE `typeslogements` ENABLE KEYS */;

-- Listage de la structure de la table fs_lemaisonier. utilisateurs
DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `idUtilisateur` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) NOT NULL,
  `genre` varchar(255) NOT NULL,
  `dateNaiss` datetime DEFAULT NULL,
  `mdp` varchar(255) NOT NULL,
  `statutUtilisateur` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idUtilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

-- Listage des données de la table fs_lemaisonier.utilisateurs : ~4 rows (environ)
/*!40000 ALTER TABLE `utilisateurs` DISABLE KEYS */;
INSERT INTO `utilisateurs` (`idUtilisateur`, `nom`, `prenom`, `email`, `tel`, `genre`, `dateNaiss`, `mdp`, `statutUtilisateur`, `createdAt`, `updatedAt`) VALUES
	(9, 'Sitchet', 'Dimitri', 'dimitrisitchet@gmail.com', '691889087', 'm', '2000-01-01 00:00:00', '$2b$05$/czwZsjr8FgzWpH4P9qlhOldD0KJRk7kwf90rpUp5PLQTpap6KT4C', 0, '2021-03-31 09:42:15', '2021-03-31 16:15:20'),
	(16, 'Sitchet', 'Dimitri', 'dimitriitchet@gmail.com', '691889088', 'm', '2000-01-01 00:00:00', '$2b$05$crRhy1y259xr5EykKnd2lugmfwgjLpdAW8ndykpevKCMYhcZAMspu', 0, '2021-03-31 17:55:15', '2021-03-31 17:55:15'),
	(21, 'Fitz ', 'Claude ', 'claudefitz@xenone.cm ', '693325331', 'm', '2002-03-03 00:00:00', '$2b$05$Y3yAuE6vK6P49/LVx/sX0OowTdQDV3snsjGI3xp7UO.axMoDCGoXW', 1, '2021-04-06 14:37:48', '2021-04-06 14:41:07');
/*!40000 ALTER TABLE `utilisateurs` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
