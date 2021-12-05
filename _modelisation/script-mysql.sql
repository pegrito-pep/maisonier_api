/*==============================================================*/
/* Nom de SGBD :  MySQL 5.0                                     */
/* Date de création :  31/03/2021 14:26:26                      */
/*==============================================================*/


drop table if exists Adresses;

drop table if exists Batiments;

drop table if exists CaracteristiquesLogements;

drop table if exists Cites;

drop table if exists Entreprises;

drop table if exists Logements;

drop table if exists Photos;

drop table if exists Roles;

drop table if exists SousTypesLogements;

drop table if exists TypeLogements;

drop table if exists Utilisateurs;

/*==============================================================*/
/* Table : Adresses                                             */
/*==============================================================*/
create table Adresses
(
   idLogement           int not null,
   pays                 varchar(254),
   ville                varchar(254),
   quartier             varchar(254),
   lon                  float,
   lat                  float,
   primary key (idLogement)
);

/*==============================================================*/
/* Table : Batiments                                            */
/*==============================================================*/
create table Batiments
(
   idBatiment           int not null auto_increment,
   idCite               int not null,
   nomBatiment          varchar(254),
   refBatiment          varchar(254),
   primary key (idBatiment)
);

/*==============================================================*/
/* Table : CaracteristiquesLogements                            */
/*==============================================================*/
create table CaracteristiquesLogements
(
   idLogement           int not null,
   libelleCaracteristique varchar(254),
   valeur               varchar(254),
   primary key (idLogement)
);

/*==============================================================*/
/* Table : Cites                                                */
/*==============================================================*/
create table Cites
(
   idCite               int not null auto_increment,
   idUtilisateur        int,
   nomCite              varchar(254),
   refCite              varchar(254),
   primary key (idCite)
);

/*==============================================================*/
/* Table : Entreprises                                          */
/*==============================================================*/
create table Entreprises
(
   idEntreprise         int not null auto_increment,
   raisonSociale        varchar(254),
   siegeSocial          varchar(254),
   registreCommerce     varchar(254),
   dateCreation         datetime,
   logo                 text,
   primary key (idEntreprise)
);

/*==============================================================*/
/* Table : Logements                                            */
/*==============================================================*/
create table Logements
(
   idLogement           int not null auto_increment,
   idUtilisateur        int not null,
   idType               int not null,
   idBatiment           int,
   refLogement          varchar(254),
   nomLogement          varchar(254),
   descLogement         varchar(254),
   prixMin              int,
   prixMax              int,
   primary key (idLogement)
);

/*==============================================================*/
/* Table : Photos                                               */
/*==============================================================*/
create table Photos
(
   idPhoto              int not null auto_increment,
   idLogement           int not null,
   image                text,
   primary key (idPhoto)
);

/*==============================================================*/
/* Table : Roles                                                */
/*==============================================================*/
create table Roles
(
   idUtilisateur        int not null,
   idEntreprise         int not null,
   role                 varchar(254),
   primary key (idUtilisateur, idEntreprise)
);

/*==============================================================*/
/* Table : SousTypesLogements                                   */
/*==============================================================*/
create table SousTypesLogements
(
   idSousType           int not null auto_increment,
   idType               int not null,
   libelleSousType      varchar(254),
   descSousType         varchar(254),
   primary key (idSousType)
);

/*==============================================================*/
/* Table : TypeLogements                                        */
/*==============================================================*/
create table TypeLogements
(
   idType               int not null auto_increment,
   libelleType          varchar(254),
   descType             varchar(254),
   primary key (idType)
);

/*==============================================================*/
/* Table : Utilisateurs                                         */
/*==============================================================*/
create table Utilisateurs
(
   idUtilisateur        int not null auto_increment,
   nom                  varchar(254),
   prenom               varchar(254),
   tel                  varchar(254),
   email                varchar(254),
   mdp                  varchar(254),
   avatar               text,
   dateNaiss            datetime,
   genre                varchar(254),
   statutUtilisateur    bool default 0,
   primary key (idUtilisateur)
);

alter table Adresses add constraint FK_Association_9 foreign key (idLogement)
      references Logements (idLogement) on delete restrict on update restrict;

alter table Batiments add constraint FK_Association_5 foreign key (idCite)
      references Cites (idCite) on delete restrict on update restrict;

alter table CaracteristiquesLogements add constraint FK_Association_10 foreign key (idLogement)
      references Logements (idLogement) on delete restrict on update restrict;

alter table Cites add constraint FK_Association_7 foreign key (idUtilisateur)
      references Utilisateurs (idUtilisateur) on delete restrict on update restrict;

alter table Logements add constraint FK_Association_1 foreign key (idType)
      references TypeLogements (idType) on delete restrict on update restrict;

alter table Logements add constraint FK_Association_4 foreign key (idBatiment)
      references Batiments (idBatiment) on delete restrict on update restrict;

alter table Logements add constraint FK_Association_6 foreign key (idUtilisateur)
      references Utilisateurs (idUtilisateur) on delete restrict on update restrict;

alter table Photos add constraint FK_Association_2 foreign key (idLogement)
      references Logements (idLogement) on delete restrict on update restrict;

alter table Roles add constraint FK_Association_8 foreign key (idEntreprise)
      references Entreprises (idEntreprise) on delete restrict on update restrict;

alter table Roles add constraint FK_Association_8 foreign key (idUtilisateur)
      references Utilisateurs (idUtilisateur) on delete restrict on update restrict;

alter table SousTypesLogements add constraint FK_Association_3 foreign key (idType)
      references TypeLogements (idType) on delete restrict on update restrict;

