-- Tablas del módulo de dorsales
-- Esquema: piaaccess

CREATE TABLE piaaccess.dorsales_config (
    id BIGSERIAL PRIMARY KEY,
    idevento BIGINT NOT NULL UNIQUE,
    posicion_x INTEGER DEFAULT 400,
    posicion_y INTEGER DEFAULT 500,
    font_size INTEGER DEFAULT 72,
    font_family VARCHAR(100) DEFAULT 'Arial',
    font_color VARCHAR(20) DEFAULT '#000000',
    campos_mostrar TEXT DEFAULT 'numero',
    CONSTRAINT fk_dorsales_config_evento FOREIGN KEY (idevento)
        REFERENCES piaaccess.tmeventos (id)
);

CREATE TABLE piaaccess.dorsales_base_imagenes (
    id BIGSERIAL PRIMARY KEY,
    idevento BIGINT NOT NULL,
    ruta_imagen VARCHAR(500) NOT NULL,
    competencias TEXT,
    categorias TEXT,
    sexos VARCHAR(50),
    posicion_x INTEGER,
    posicion_y INTEGER,
    font_size INTEGER,
    font_family VARCHAR(100),
    font_color VARCHAR(20),
    campos_mostrar TEXT,
    campos_config JSON,
    subido_el TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_dorsales_base_imagenes_evento FOREIGN KEY (idevento)
        REFERENCES piaaccess.tmeventos (id)
);

CREATE TABLE piaaccess.dorsales_imagenes (
    id BIGSERIAL PRIMARY KEY,
    idevento BIGINT NOT NULL,
    idinscrito BIGINT NOT NULL,
    iddocumento VARCHAR(20) NOT NULL,
    ruta_imagen VARCHAR(500) NOT NULL,
    generado_el TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_dorsales_imagenes_evento FOREIGN KEY (idevento)
        REFERENCES piaaccess.tmeventos (id)
);

CREATE INDEX idx_dorsales_imagenes_idevento ON piaaccess.dorsales_imagenes (idevento);
CREATE INDEX idx_dorsales_imagenes_iddocumento ON piaaccess.dorsales_imagenes (iddocumento);
CREATE INDEX idx_dorsales_base_imagenes_idevento ON piaaccess.dorsales_base_imagenes (idevento);
