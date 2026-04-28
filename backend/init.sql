-- ==========================================
-- FLOWTASK - Script SQL de Inicialização
-- ==========================================
-- Use este script para criar o banco de dados e tabelas
-- Executar em: MySQL ou PhpMyAdmin

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS flowtask;
USE flowtask;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'planejamento',
  prazo DATE,
  icon VARCHAR(10),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projeto_id INT NOT NULL,
  usuario_id INT,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  prioridade VARCHAR(50) DEFAULT 'media',
  data_vencimento DATE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_projetos_usuario ON projetos(usuario_id);
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_usuario ON tarefas(usuario_id);

-- ==========================================
-- Dados de Teste (Opcional)
-- ==========================================
-- Comentar ou descomentar conforme necessário

-- INSERT INTO usuarios (nome, email, senha) VALUES 
-- ('Admin User', 'admin@flowtask.com', '$2y$10$...'); -- Hash BCRYPT
