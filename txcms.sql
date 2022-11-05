-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 06 nov. 2022 à 00:46
-- Version du serveur : 10.4.25-MariaDB
-- Version de PHP : 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `txcms`
--

-- --------------------------------------------------------

--
-- Structure de la table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `owner` int(255) NOT NULL,
  `planID` int(11) NOT NULL,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `carts`
--

INSERT INTO `carts` (`id`, `owner`, `planID`, `amount`) VALUES
(1, 36, 30, 2),
(2, 36, 44, 5);

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `server` varchar(255) NOT NULL,
  `auto` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `server`, `auto`) VALUES
(1, 'game', 'pterodactyl', 1),
(2, 'cloud', 'proxmox', 1),
(3, 'web', 'plesk', 1),
(6, 'test', 'pterodactyl', 1);

-- --------------------------------------------------------

--
-- Structure de la table `plans`
--

CREATE TABLE `plans` (
  `id` int(255) NOT NULL,
  `name` text NOT NULL,
  `categorie` varchar(255) NOT NULL,
  `price` text NOT NULL,
  `stock` tinyint(1) NOT NULL,
  `state` varchar(255) NOT NULL,
  `selled` int(255) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `plans`
--

INSERT INTO `plans` (`id`, `name`, `categorie`, `price`, `stock`, `state`, `selled`) VALUES
(30, 'Tx-Game 1', 'game', '1.25', 0, 'public', 0),
(43, 'Tx-Game 2', 'game', '6.50', 1, 'public', 0),
(44, 'Tx-Game 3', 'game', '11.75', 1, 'public', 0);

-- --------------------------------------------------------

--
-- Structure de la table `servers`
--

CREATE TABLE `servers` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `fqdn` varchar(255) NOT NULL,
  `clientapikey` varchar(255) NOT NULL,
  `appapikey` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `servers`
--

INSERT INTO `servers` (`id`, `name`, `fqdn`, `clientapikey`, `appapikey`) VALUES
(1, 'pterodactyl', 'https://panel.txhost.fr', 'ptlc_XBGDCNGtKCt49rWQ0c4SGhEHic3HBOfCK83ou36ykgB', 'ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC'),
(2, 'proxmox', 'https://pve.txhost.fr', 'root', 'motdepasse'),
(3, 'plesk', 'https://web.txhost.fr', 'root', 'motdepasse');

-- --------------------------------------------------------

--
-- Structure de la table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('SOVa77fkopEfSwbj7Z6hKJQVM2FhCZKy', 1667775015, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":[{\"id\":36,\"name\":\"Toufik\",\"lastname\":\"Tala Ighil\",\"email\":\"talaighiltoufik@outlook.fr\",\"password\":\"$2b$10$m9kHQWpjoX5ogivTyzg3nuMOFAmUur0fqe5VslHqzX84E/CayeThK\",\"sexe\":\"male\",\"birthday\":\"2004-06-22\",\"role\":\"user\",\"logo\":null,\"usernote\":null,\"wallet\":0,\"services\":0,\"transactions\":0,\"tikets\":0}]},\"flash\":{}}');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `lastname` text NOT NULL,
  `email` text NOT NULL,
  `password` varchar(255) NOT NULL,
  `sexe` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `logo` varchar(255) DEFAULT NULL,
  `usernote` text DEFAULT NULL,
  `cart` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cart`)),
  `wallet` int(255) NOT NULL DEFAULT 0,
  `services` int(255) NOT NULL DEFAULT 0,
  `transactions` int(255) DEFAULT 0,
  `tikets` int(255) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `lastname`, `email`, `password`, `sexe`, `birthday`, `role`, `logo`, `usernote`, `cart`, `wallet`, `services`, `transactions`, `tikets`) VALUES
(1, 'Jean', 'Martin', 'jeanmartin@txhost.fr', '$2b$10$vVBCqHBY3fXVfBvbJ4adQeRy0OSnR374dCDAHF.uwkZ4XvDDbILvG', 'male', '2001-01-04', 'user', NULL, NULL, NULL, 0, 0, 0, 0),
(36, 'Toufik', 'Tala Ighil', 'talaighiltoufik@outlook.fr', '$2b$10$m9kHQWpjoX5ogivTyzg3nuMOFAmUur0fqe5VslHqzX84E/CayeThK', 'male', '2004-06-22', 'user', NULL, NULL, '{}', 0, 0, 0, 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PlanCart (ID)` (`planID`),
  ADD KEY `CartOwner (ID)` (`owner`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `CategorieServer` (`server`);

--
-- Index pour la table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `price` (`price`) USING HASH,
  ADD UNIQUE KEY `name` (`name`(255)),
  ADD KEY `PlanCategorie` (`categorie`);

--
-- Index pour la table `servers`
--
ALTER TABLE `servers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT pour la table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `CartOwner (ID)` FOREIGN KEY (`owner`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `PlanCart (ID)` FOREIGN KEY (`planID`) REFERENCES `plans` (`id`);

--
-- Contraintes pour la table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `CategorieServer` FOREIGN KEY (`server`) REFERENCES `servers` (`name`);

--
-- Contraintes pour la table `plans`
--
ALTER TABLE `plans`
  ADD CONSTRAINT `PlanCategorie` FOREIGN KEY (`categorie`) REFERENCES `categories` (`name`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
