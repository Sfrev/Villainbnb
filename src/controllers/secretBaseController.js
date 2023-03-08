const express = require('express');
const bcrypt = require('bcryptjs');

const SecretBase = require('../models/SecretBase');

const router = express.Router();

const cities = ["Nova York", "Rio de Janeiro", "Tóquio", undefined, ""];
const technologies = ["Laboratório de Nanotecnologia", "Jardim de Ervas Venenosas", 
"Estande de Tiro e Academia de Parkour", undefined, ""];

const senhaSecretaAssiacaoViloes = "senhaSecretaAssociacaoViloes906783472757375478";

router.post('/register', async (req, res) => {

    /*
    Exemplo de requisição:
    {
        "titulo" : "Base", 
        "nomeFachada" : "Base Secreta",
        "cidade" : "Tóquio", 
        "tecnologia" : "Estande de Tiro e Academia de Parkour",
        "estaAlugada": false
    }
    */
    	
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
        else if (!cities.includes(secretBase.cidade)) {
            return res.status(400).send({ erro: 'Cidade não coberta pela associação de vilões' });
        }
        else if (!technologies.includes(secretBase.tecnologia)) {
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
            if (typeof secretBase[key] != 'string' && key != 'estaAlugada') {
                return res.status(400).send({ erro:  `O campo ${key} deve ser do tipo String`});
            }
        }

        //nao é necessario informar o campo estaAlugada, pois ele ja é definido como false no model

        const newSecretBase = await SecretBase.create(secretBase);

        return res.status(201).send({ newSecretBase });
    }
    catch (err) {
        return res.status(404).send({ erro: `Registration failed, ${err}` });
    }
});

router.put('/update', async (req, res) => {

    /*
    Exemplo de requisição:
    {
        "titulo" : "Base",
        "novoTitulo" : "Base Secreta",
        "nomeFachada" : "Base Secreta 2",
        "cidade" : "Tóquio",
        "tecnologia" : "Estande de Tiro e Academia de Parkour",
        "estaAlugada": false
    }
    */

    //se o inquilino nao informar algum campo, o valor permanece o mesmo

    const baseSecretaAtualizada = req.body;

    try {
        const baseSecretaNomeFachada = await SecretBase.findOne({ nomeFachada: baseSecretaAtualizada.nomeFachada }); //Filtrando nome de fachada
        const baseSecretaNovoTitulo = await SecretBase.findOne({ titulo: baseSecretaAtualizada.novoTitulo }); //Filtrando novo titulo
        const baseSecretaAntiga = await SecretBase.findOne({ titulo: baseSecretaAtualizada.titulo }); //Filtrando base secreta antiga

        if (!baseSecretaAntiga) {
            return res.status(400).send({ erro: 'Título não encontrado' });
        }
        else if (baseSecretaNovoTitulo) {
            return res.status(400).send({ erro: 'Novo título já cadastrado' });
        }
        else if (baseSecretaNomeFachada && baseSecretaNomeFachada.titulo != baseSecretaAtualizada.titulo) {
            return res.status(400).send({ erro: 'Nome da Fachada já cadastrado' });
        }
        else if (baseSecretaAtualizada.titulo == baseSecretaAtualizada.nomeFachada) {
            return res.status(400).send({ erro: 'Título e Nome da Fachada não podem ser iguais' });
        }
        else if (!cities.includes(baseSecretaAtualizada.cidade)) {
            return res.status(400).send({ erro: 'Cidade não coberta pela associação de vilões' });
        }
        else if (!technologies.includes(baseSecretaAtualizada.tecnologia)) {
            return res.status(400).send({ erro: 'Tecnologia não disponível' });
        }

        for (const key of Object.keys(baseSecretaAtualizada)) {
            if (typeof baseSecretaAtualizada[key] != 'string' && key != 'estaAlugada') {
                return res.status(400).send({ erro: `O campo ${key} deve ser do tipo String` });
            }
            if (baseSecretaAtualizada[key]) {
                if (key === 'novoTitulo') {                   
                    baseSecretaAntiga['titulo'] = baseSecretaAtualizada[key];                  
                }
                else {
                    baseSecretaAntiga[key] = baseSecretaAtualizada[key];
                }
            }
        }

        baseSecretaAntiga.save().then(() => {
            console.log('Base Secreta atualizada com sucesso');
        }).catch((err) => {
            console.log(`Erro ao atualizar a base secreta: ${err}`);
        });

        return res.send({ baseSecretaAntiga });

    }catch(err) {
        return res.status(404).send({ erro: `Update failed ${err}`});
    }
});

router.delete('/delete', async (req, res) => {

    /*
    Exemplo de requisição:
    {
        "titulo" : "Base"
    }
    */

    const { titulo } = req.body;
    
    try {
        const secretBase = await SecretBase.findOneAndRemove({ titulo });

        if (typeof titulo != 'string') {
            return res.status(400).send({ erro:  `O campo título deve ser do tipo String`});
        }
        else if (!secretBase) {
            return res.status(200).send({ erro: 'Base Secreta não encontrada' });
        }
    
        return res.send({ secretBase });
    }
    catch(err) {
        return res.status(404).send({ erro: `Delete failed ${err}` });
    }
});

router.get('/list', async (req, res) => {

    const { titulo, cidade, tecnologia } = req.query;

    let query = {};
    
    try {

        if (titulo) {
            query.titulo = titulo;
        }
        if (cidade) {
            query.cidade = cidade;
        }
        if (tecnologia) {
            query.tecnologia = tecnologia;
        }

        const secretBases = await SecretBase.find( query ).sort('titulo').select('-_id -__v -nomeFachada');

        if (secretBases.length == 0) {
            return res.status(404).send({ erro: 'Bases Secretas não encontradas' });
        }

        return res.status(200).send({ secretBases });

    }catch(err) {
        return res.status(404).send({ erro: `Lista não encontrada ${err}` });
    }
});

router.post('/alugar', async (req, res) => {

    /*
    Exemplo de requisição:
    {
        "titulo": "Base",
        "nomeFachada": "Base Secreta",
        "senha": "senhaSecretaAssociacaoViloes906783472757375478"
    }
    */

    const baseSecretaAlugarRequisicao = req.body;

    try {
        const baseSecretaAlugar = await SecretBase.findOne({ titulo: baseSecretaAlugarRequisicao.titulo });

        if (!baseSecretaAlugar) {
            return res.status(404).send({ erro: 'Base Secreta não encontrada' });
        }
        else if (baseSecretaAlugarRequisicao.nomeFachada != baseSecretaAlugar.nomeFachada) {
            return res.status(400).send({ erro: 'Nome da fachada incorreto' });
        }

        for (const key of Object.keys(baseSecretaAlugarRequisicao)) {
            if (typeof baseSecretaAlugarRequisicao[key] != 'string') {
                return res.status(400).send({ erro:  `O campo ${key} deve ser do tipo String`});
            }
        }

        if (baseSecretaAlugarRequisicao.senha !== senhaSecretaAssiacaoViloes) {
            return res.status(401).send({ erro: 'Senha incorreta' });
        }
        else if (baseSecretaAlugar.estaAlugada) {
            return res.status(400).send({ erro: 'Base Secreta já alugada' });
        }

        baseSecretaAlugar.estaAlugada = true;

        await baseSecretaAlugar.save();

        return res.status(200).send({ baseSecretaAlugar });

    }catch(err) {
        return res.status(404).send({ erro: `Erro ${err}` });
    }

});

// APENAS PARA DEBUG
router.delete('/delete-all', async (req, res) => {
    try {
        await SecretBase.deleteMany({});
        return res.status(200).send({ message: 'Todas as bases secretas foram deletadas' });
    }catch(err) {
        return res.status(404).send({ erro: `Erro ${err}` });
    }
});

module.exports = app => app.use('/secret-base', router);