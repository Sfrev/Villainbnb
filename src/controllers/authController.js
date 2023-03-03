const express = require('express');
const bcrypt = require('bcryptjs');

const SecretBase = require('../models/SecretBase');

const router = express.Router();

const cidades = ["Nova York", "Rio de Janeiro", "Tóquio"];
const tecnologias = ["Laboratório de Nanotecnologia", "Jardim de Ervas Venenosas", "Estande de Tiro e Academia de Parkour"];

router.post('/register', async (req, res) => {
    	
    const { titulo, nomeFachada, cidade, tecnologia } = req.body;

    try {
        if (await SecretBase.findOne({ titulo })) {
            return res.status(400).send({ error: 'Titulo já cadastrado' });
        }
        else if (await SecretBase.findOne(nomeFachada)){
            return res.status(400).send({ error: 'Nome da Fachada já cadastrado' });
        }
        else if (!cidades.includes(cidade)) {
            return res.status(400).send({ error: 'Cidade não coberta pela associação de vilões' });
        }
        else if (!tecnologias.includes(tecnologia)) {
            return res.status(400).send({ error: 'Tecnologia não disponível' });
        }
        else if (titulo == undefined || nomeFachada == undefined || cidade == undefined || tecnologia == undefined) {
            return res.status(400).send({ error: 'Preencha todos os campos' });
        }
        else if (titulo == "" || nomeFachada == "" || cidade == "" || tecnologia == "") {
            return res.status(400).send({ error: 'Preencha todos os campos' });
        }
        else if (titulo == await SecretBase.findOne(nomeFachada) || nomeFachada == await SecretBase.findOne(titulo)) {
            return res.status(400).send({ error: 'Titulo e Nome da Fachada não podem ser iguais' });
        }

        const newSecretBase = await SecretBase.create(req.body);

        newSecretBase.nomeFachada = undefined;
        return res.status(201).send({ newSecretBase });
    }
    catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.put('/update/:tituloParam', async (req, res) => {
    const { tituloParam } = req.params;
    const { titulo: novoTitulo, nomeFachada: novoNomeFachada, cidade: novaCidade, tecnologia: novaTecnologia } = req.body;

    try{
        
        const nomeFachada = await SecretBase.findOne({ nomeFachada: novoNomeFachada });

        if (await SecretBase.findOne({ titulo: novoTitulo })) {
            return res.status(400).send({ error: 'Titulo já cadastrado' });
        }
        else if (nomeFachada) {
            return res.status(400).send({ error: 'Nome da Fachada já cadastrado' });
        }
        else if (!cidades.includes(novaCidade)) {
            return res.status(400).send({ error: 'Cidade não coberta pela associação de vilões' });
        }
        else if (!tecnologias.includes(novaTecnologia)) {
            return res.status(400).send({ error: 'Tecnologia não disponível' });
        }
        else if (novoTitulo == undefined || novoNomeFachada == undefined || novaCidade == undefined || novaTecnologia == undefined) {
            return res.status(400).send({ error: 'Preencha todos os campos' });
        }
        else if (novoTitulo === "" || novoNomeFachada === "" || novaCidade === "" || novaTecnologia === "") {
            return res.status(400).send({ error: 'Preencha todos os campos' });
        }
        else if (novoTitulo === nomeFachada || novoNomeFachada === await SecretBase.findOne({ titulo: novoTitulo })) {
            return res.status(400).send({ error: 'Titulo e Nome da Fachada não podem ser iguais' });
        }

        const updatedSecretBase = await SecretBase.findOneAndUpdate({ titulo: tituloParam }, {titulo: novoTitulo, nomeFachada: 
            novoNomeFachada, cidade: novaCidade, tecnologia: novaTecnologia});

        updatedSecretBase.nomeFachada = undefined;
        return res.send({ updatedSecretBase });

    }catch(err){
        return res.status(400).send({ error: 'Update failed' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const secretBase = await SecretBase.findByIdAndDelete(id);

    if (!secretBase) {
        return res.status(204).send({error: 'Base Secreta não encontrada'});
    }

    return res.send({ secretBase });
});

router.get('/list', async (req, res) => {
    
    try{
    // listar todas as bases secretas e ordenar por titulo
    const secretBases = await SecretBase.find().sort('titulo');

    if (!secretBases) {
        return res.status(404).send({ error: 'Bases Secretas não encontradas' });
    }

    return res.status(200).send({ secretBases });

    }catch(err){
        return res.status(404).send({ error: 'Lista não encontrada' });
    }
});

router.get('/list/titulo/:titulo', async (req, res) => {
    const { titulo } = req.params;

    try{
        const secretBase = await SecretBase.findOne({ titulo });

        if (!secretBase) {
            return res.status(404).send({ error: 'Base Secreta não encontrada' });
        }

        return res.status(200).send({ secretBase });

    }catch(err){
        return res.status(404).send({ error: 'Erro' });
    }
});

router.get('/list/cidade/:cidade', async (req, res) => {
    let { cidade } = req.params;

    try{
        cidade = cidade.replaceAll('_', ' ');
        const secretBase = await SecretBase.find({ cidade });

        if (!secretBase) {
            return res.status(404).send({ error: 'Base Secreta não encontrada' });
        }

        return res.status(200).send({ secretBase });

    }catch(err){
        return res.status(404).send({ error: 'Erro' });
    }
});

router.get('/list/tecnologias_disponiveis/:tecnologia', async (req, res) => {
    let { tecnologia } = req.params;

    try{
        tecnologia = tecnologia.replaceAll('_', ' ');
        const secretBase = await SecretBase.find({ tecnologia });

        if (!secretBase) {
            return res.status(404).send({ error: 'Base Secreta não encontrada' });
        }

        return res.status(200).send({ secretBase });

    }catch(err){
        return res.status(404).send({ error: 'Erro' });
    }
});

module.exports = app => app.use('/auth', router);