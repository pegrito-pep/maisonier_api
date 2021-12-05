/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 8                                  */
/* Date de création :  31/03/2021 14:24:58                      */
/*==============================================================*/


drop table Adresses;

drop table Batiments;

drop table CaracteristiquesLogements;

drop table Cites;

drop table Entreprises;

drop table Logements;

drop table Photos;

drop table Roles;

drop table SousTypesLogements;

drop table TypeLogements;

drop table Utilisateurs;

/*==============================================================*/
/* Table : TypeLogements                                        */
/*==============================================================*/
create table TypeLogements (
   idType               SERIAL               not null,
   libelleType          VARCHAR(254)         null,
   descType             VARCHAR(254)         null,
   constraint PK_TYPELOGEMENTS primary key (idType)
);

/*==============================================================*/
/* Table : Utilisateurs                                         */
/*==============================================================*/
create table Utilisateurs (
   idUtilisateur        SERIAL               not null,
   nom                  VARCHAR(254)         null,
   prenom               VARCHAR(254)         null,
   tel                  VARCHAR(254)         null,
   email                VARCHAR(254)         null,
   mdp                  VARCHAR(254)         null,
   avatar               TEXT                 null,
   dateNaiss            DATE                 null,
   genre                VARCHAR(254)         null
      constraint CKC_GENRE_UTILISAT check (genre is null or (genre in ('m','f','entreprise'))),
   statutUtilisateur    BOOL                 null default 0,
   constraint PK_UTILISATEURS primary key (idUtilisateur)
);

/*==============================================================*/
/* Table : Cites                                                */
/*==============================================================*/
create table Cites (
   idCite               SERIAL               not null,
   idUtilisateur        INT4                 null,
   nomCite              VARCHAR(254)         null,
   refCite              VARCHAR(254)         null,
   constraint PK_CITES primary key (idCite),
   constraint FK_CITES_ASSOCIATI_UTILISAT foreign key (idUtilisateur)
      references Utilisateurs (idUtilisateur)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : Batiments                                            */
/*==============================================================*/
create table Batiments (
   idBatiment           SERIAL               not null,
   idCite               INT4                 not null,
   nomBatiment          VARCHAR(254)         null,
   refBatiment          VARCHAR(254)         null,
   constraint PK_BATIMENTS primary key (idBatiment),
   constraint FK_BATIMENT_ASSOCIATI_CITES foreign key (idCite)
      references Cites (idCite)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : Logements                                            */
/*==============================================================*/
create table Logements (
   idLogement           SERIAL               not null,
   idUtilisateur        INT4                 not null,
   idType               INT4                 not null,
   idBatiment           INT4                 null,
   refLogement          VARCHAR(254)         null,
   nomLogement          VARCHAR(254)         null,
   descLogement         VARCHAR(254)         null,
   prixMin              INT4                 null,
   prixMax              INT4                 null,
   constraint PK_LOGEMENTS primary key (idLogement),
   constraint FK_LOGEMENT_ASSOCIATI_TYPELOGE foreign key (idType)
      references TypeLogements (idType)
      on delete restrict on update restrict,
   constraint FK_LOGEMENT_ASSOCIATI_BATIMENT foreign key (idBatiment)
      references Batiments (idBatiment)
      on delete restrict on update restrict,
   constraint FK_LOGEMENT_ASSOCIATI_UTILISAT foreign key (idUtilisateur)
      references Utilisateurs (idUtilisateur)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : Adresses                                             */
/*==============================================================*/
create table Adresses (
   idLogement           INT4                 not null,
   pays                 VARCHAR(254)         null,
   ville                VARCHAR(254)         null,
   quartier             VARCHAR(254)         null,
   lon                  FLOAT8               null,
   lat                  FLOAT8               null,
   constraint PK_ADRESSES primary key (idLogement),
   constraint FK_ADRESSES_ASSOCIATI_LOGEMENT foreign key (idLogement)
      references Logements (idLogement)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : CaracteristiquesLogements                            */
/*==============================================================*/
create table CaracteristiquesLogements (
   idLogement           INT4                 not null,
   libelleCaracteristique VARCHAR(254)         null,
   valeur               VARCHAR(254)         null,
   constraint PK_CARACTERISTIQUESLOGEMENTS primary key (idLogement),
   constraint FK_CARACTER_ASSOCIATI_LOGEMENT foreign key (idLogement)
      references Logements (idLogement)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : Entreprises                                          */
/*==============================================================*/
create table Entreprises (
   idEntreprise         SERIAL               not null,
   raisonSociale        VARCHAR(254)         null,
   siegeSocial          VARCHAR(254)         null,
   registreCommerce     VARCHAR(254)         null,
   dateCreation         DATE                 null,
   logo                 TEXT                 null,
   constraint PK_ENTREPRISES primary key (idEntreprise)
);

/*==============================================================*/
/* Table : Photos                                               */
/*==============================================================*/
create table Photos (
   idPhoto              SERIAL               not null,
   idLogement           INT4                 not null,
   image                TEXT                 null,
   constraint PK_PHOTOS primary key (idPhoto),
   constraint FK_PHOTOS_ASSOCIATI_LOGEMENT foreign key (idLogement)
      references Logements (idLogement)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : Roles                                                */
/*==============================================================*/
create table Roles (
   idUtilisateur        INT4                 not null,
   idEntreprise         INT4                 not null,
   role                 VARCHAR(254)         null,
   constraint PK_ROLES primary key (idUtilisateur, idEntreprise),
   constraint FK_ROLES_ASSOCIATI_UTILISAT foreign key (idUtilisateur)
      references Utilisateurs (idUtilisateur)
      on delete restrict on update restrict,
   constraint FK_ROLES_ASSOCIATI_ENTREPRI foreign key (idEntreprise)
      references Entreprises (idEntreprise)
      on delete restrict on update restrict
);

/*==============================================================*/
/* Table : SousTypesLogements                                   */
/*==============================================================*/
create table SousTypesLogements (
   idSousType           SERIAL               not null,
   idType               INT4                 not null,
   libelleSousType      VARCHAR(254)         null,
   descSousType         VARCHAR(254)         null,
   constraint PK_SOUSTYPESLOGEMENTS primary key (idSousType),
   constraint FK_SOUSTYPE_ASSOCIATI_TYPELOGE foreign key (idType)
      references TypeLogements (idType)
      on delete restrict on update restrict
);

