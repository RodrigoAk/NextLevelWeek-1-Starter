const express = require("express")
const server = express()

// pegar o banco de dados
const db = require("./database/db")


// configurar pasta publica
server.use(express.static("public"))

// habilitar o uso do request.body na nossa aplicacao
server.use(express.urlencoded({ extended: true }))


// Utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// configurar caminhos da minha aplicacao
// pagina inicial
// req: requisicao
// res: resposta
server.get("/", (request, response) => {
    return response.render("index.html")
})

// Create points
server.get("/create-point", (request, response) => {
    return response.render("create-point.html")
})

// Apos o usuario submeter o formulario de cadastro
server.post("/savepoint", (request, response) => {

    // request.body: O corpo do nosso formulario
    console.log(request.body)

    // inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        request.body.image,
        request.body.name,
        request.body.address,
        request.body.address2,
        request.body.state,
        request.body.city,
        request.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return response.send("Erro no cadastro")
        }

        console.log("Cadastrado com sucesso!")
        console.log(this)

        return response.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData)
})



// Search results
server.get("/search", (request, response) => {

    const search = request.query.search

    if(search == "") {
        // pesquisa vazia
        return response.render("search-results.html", { total: 0 })
    }

    // pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }
        console.log("Aqui estão os seus registros:")
        console.log(rows)

        const total = rows.length

        // mostrar a pagina html com os dados do banco de dados
        return response.render("search-results.html", { places: rows , total })

    })
})


// ligar o servidor
server.listen(3000)