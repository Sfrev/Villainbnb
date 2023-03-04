const express = require('express');
const bcrypt = require('bcryptjs');

const SecretBase = require('../models/SecretBase');

const router = express.Router();

const cidades = ["Nova York", "Rio de Janeiro", "Tóquio", undefined, ""];
const tecnologias = ["Laboratório de Nanotecnologia", "Jardim de Ervas Venenosas", 
"Estande de Tiro e Academia de Parkour", undefined, ""];

router.post('/register', async (req, res) => {
    	
    const secretBase = req.body;

    try {

        const secretBaseTitulo = await SecretBase.findOne({ titulo: secretBase.titulo });
        const secretBaseNomeFachada = await SecretBase.findOne({ nomeFachada: secretBase.nomeFachada }); 

        if (secretBaseTitulo) {
            return res.status(400).send({ erro: 'Titulo já cadastrado' });
        }
        else if (secretBaseNomeFachada) {
            return res.status(400).send({ erro: 'Nome da Fachada já cadastrado' });
        }
        else if (!cidades.includes(secretBase.cidade)) {
            return res.status(400).send({ erro: 'Cidade não coberta pela associação de vilões' });
        }
        else if (!tecnologias.includes(secretBase.tecnologia)) {
            return res.status(400).send({ erro: 'Tecnologia não disponível' });
        }
        else if (secretBase.titulo == undefined || secretBase.nomeFachada == undefined || 
        secretBase.cidade == undefined || secretBase.tecnologia == undefined) {
            return res.status(400).send({ erro: 'Preencha todos os campos' });
        }
        else if (secretBase.titulo == "" || secretBase.nomeFachada == "" || secretBase.cidade == "" || 
        secretBase.tecnologia == "") {
            return res.status(400).send({ erro: 'Preencha todos os campos' });
        }
        else if (secretBase.titulo == secretBaseNomeFachada || secretBase.nomeFachada == secretBaseTitulo) {
            return res.status(400).send({ erro: 'Titulo e Nome da Fachada não podem ser iguais' });
        }
        
        for (const key of Object.keys(secretBase)) {
            if (typeof secretBase[key] != 'string') {
                return res.status(400).send({ erro:  `O campo ${key} deve ser do tipo String`});
            }
        }

        const newSecretBase = await SecretBase.create(secretBase);

        newSecretBase.nomeFachada = undefined;

        return res.status(201).send({ newSecretBase });
    }
    catch (err) {
        return res.status(404).send({ erro: `Registration failed, ${err}` });
    }
});

router.put('/update', async (req, res) => {

    const secretBase = req.body;

    try {
        
        const nomeFachadaObject = await SecretBase.findOne({ nomeFachada: secretBase.nomeFachada });
        const tituloObject = await SecretBase.findOne({ titulo: secretBase.novoTitulo });
        const antigoTitulo = await SecretBase.findOne({ titulo: secretBase.titulo });

        if (tituloObject) {
            return res.status(400).send({ erro: 'Novo titulo já cadastrado' });
        }
        else if (nomeFachadaObject) {
            return res.status(400).send({ erro: 'Nome da Fachada já cadastrado' });
        }
        else if (!cidades.includes(secretBase.cidade)) {
            return res.status(400).send({ erro: 'Cidade não coberta pela associação de vilões' });
        }
        else if (!tecnologias.includes(secretBase.tecnologia)) {
            return res.status(400).send({ erro: 'Tecnologia não disponível' });
        }
        else if (secretBase.novoTitulo === nomeFachadaObject || secretBase.nomeFachada === tituloObject) {
            return res.status(400).send({ erro: 'Titulo e Nome da Fachada não podem ser iguais' });
        }
        else if (!await SecretBase.findOne({ titulo: secretBase.titulo })) {
            return res.status(400).send({ erro: 'Titulo nao encontrado' });
        }

        for (const key of Object.keys(secretBase)) {
            if (!(secretBase[key] == undefined || secretBase[key] == "")) {
                if (key === 'novoTitulo') {                   
                    antigoTitulo['titulo'] = secretBase[key];                  
                }
                else {
                    antigoTitulo[key] = secretBase[key];
                }
            }

            if (typeof secretBase[key] != 'string') {
                return res.status(400).send({ erro:  `O campo ${key} deve ser do tipo String`});
            }
        }

        const updatedSecretBase = await SecretBase.findOneAndUpdate({ titulo: secretBase.titulo }, antigoTitulo);

        updatedSecretBase.nomeFachada = undefined;
        return res.send({ updatedSecretBase });

    }catch(err) {
        return res.status(404).send({ erro: `Update failed ${err}`});
    }
});

router.delete('/delete', async (req, res) => {
    const { titulo } = req.body;
    
    try {
        const secretBase = await SecretBase.findOneAndRemove({ titulo });

        if (typeof titulo != 'string') {
            return res.status(400).send({ erro:  `O campo título deve ser do tipo String`});
        }

        if (!secretBase) {
            return res.status(204).send({ erro: 'Base Secreta não encontrada' });
        }
    
        return res.send({ secretBase });
    }
    catch(err) {
        return res.status(404).send({ erro: `Delete failed ${err}` });
    }
});

router.get('/list', async (req, res) => {
    
    try {
    // listar todas as bases secretas e ordenar por titulo
    const secretBases = await SecretBase.find().sort('titulo');

    if (secretBases.length == 0) {
        return res.status(404).send({ erro: 'Bases Secretas não encontradas' });
    }

    return res.status(200).send({ secretBases });

    }catch(err) {
        return res.status(404).send({ erro: `Lista não encontrada ${err}` });
    }
});

router.post('/list/titulo', async (req, res) => {
    const { titulo } = req.body;

    try {
        const secretBase = await SecretBase.findOne({ titulo });

        if (typeof titulo != 'string') {
            return res.status(400).send({ erro:  `O campo título deve ser do tipo String`});
        }

        if (!secretBase) {
            return res.status(404).send({ erro: 'Base Secreta não encontrada' });
        }

        return res.status(200).send({ secretBase });

    }catch(err) {
        return res.status(404).send({ erro: `Erro ${err}` });
    }
});

router.post('/list/cidade', async (req, res) => {
    let { cidade } = req.body;

    try {
        
        const secretBases = await SecretBase.find({ cidade: cidade });

        if (typeof cidade != 'string') {
            return res.status(400).send({ erro:  `O campo cidade deve ser do tipo String`});
        }

        if (secretBases.length == 0) {
            return res.status(404).send({ erro: 'Base Secreta não encontrada' });
        }

        return res.status(200).send({ secretBases });

    }catch(err) {
        return res.status(404).send({ erro: `Erro ${err}` });
    }
});

router.post('/list/tecnologias_disponiveis', async (req, res) => {
    let { tecnologia } = req.body;

    try {
        const secretBases = await SecretBase.find({ tecnologia });

        if (typeof tecnologia != 'string') {
            return res.status(400).send({ erro:  `O campo tecnologia deve ser do tipo String`});
        }

        if (secretBases.length == 0) {
            return res.status(404).send({ erro: 'Base Secreta não encontrada' });
        }

        return res.status(200).send({ secretBases });

    }catch(err) {
        return res.status(404).send({ erro: `Erro ${err}` });
    }
});

module.exports = app => app.use('/auth', router);