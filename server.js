import express from 'express';
import { Server } from "socket.io";
import { createServer } from 'http';
import { executionAsyncResource } from 'async_hooks';
import mysql from 'mysql2'
import { log } from 'console';

const app = express();
const server = createServer(app);
const io = new Server(server);

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pizza_db',
    connectionLimit: 10
})
let nbrPizza
let utilConnected = null;
const pool$ = pool.promise();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))

// __________________ROUTE_________ADMIN_____________________________

//--------------------AFFICHER PIzza----------------------------

app.get('/accueilAdmin/Pizzas', async (req, res) => {
    const [displayPizza] = await pool$.execute('select * from pizzas')
    res.render('viewsAdmin/adPizzas', {
        pizzas: displayPizza,
        utilConnected : utilConnected,

    })
})
//--------------------------AJOUT-------PIzza----------------
app.post('/accueilAdmin/Pizzas', async (req, res) => {
    const [insertPizza] = await pool$.execute(`insert into pizzas(code_pizza,libelle_pizza,ingredient_pizza,categorie_pizza,prix_pizza, version_pizza) values(?,?,?,?,?,?)`, [req.body.CodePizza, req.body.libellePizza, req.body.ingredientPizza, req.body.categoriePizza, req.body.prixPizza, req.body.versionPizza]);
    console.log(req.body.CodePizza, req.body.libellePizza, req.body.ingredientPizza, req.body.categoriePizza, req.body.prixPizza, req.body.versionPizza);
    const [[recupPizza]] = await pool$.execute(`select * FROM pizzas WHERE id_pizza=?`, [insertPizza.insertId],);
    const [displayPizza] = await pool$.execute('select * from pizzas')

    io.emit('serveur:newPizza',recupPizza)

    res.redirect('/accueilAdmin/Pizzas')
})

//--------------------------MODIFIER------PIzza-----------------
app.get('/accueilAdmin/adMajPizza/:id', async (req, res) => {
    const [[recupPizza]] = await pool$.execute(`select * FROM pizzas WHERE id_pizza=?`, [req.params.id],);
    console.log(recupPizza);
    res.render('viewsAdmin/adMajPizza', {
        title: 'Maj',
        majPizza: recupPizza,
        utilConnected : utilConnected,
    })
});

app.post('/accueilAdmin/adMajPizza/:id', async (req, res) => {
    const [majPizza] = await pool$.execute(`update pizzas set code_pizza = ?,libelle_pizza = ?,ingredient_pizza = ?,categorie_pizza = ?, prix_pizza = ?,version_pizza= ? where id_pizza = ? `, [req.body.CodePizza, req.body.libellePizza, req.body.ingredientPizza, req.body.categoriePizza, req.body.prixPizza, req.body.versionPizza, req.params.id]);

    res.redirect('/accueilAdmin/Pizzas')
});

//--------------------------DELETE---------PIzza--------------
app.get('/accueilAdmin/Pizzas/:id', async (req, res) => {
    const [deletePizza] = await pool$.execute(`delete from pizzas WHERE id_pizza=?`, [req.params.id])
    res.redirect('/accueilAdmin/Pizzas')
});

//--------------------AFFICHER UTILISATEURS----------------------------
app.get('/accueilAdmin/adUtilisateurs', async (req, res) => {
    const [utilisateurs] = await pool$.execute(`SELECT * FROM utilisateurs`)
    // console.log(utilisateurs);
    res.render('viewsAdmin/adUtilisateurs', {
        title: '',
        utilisateurs: utilisateurs,
        utilConnected : utilConnected,
    })
})

//--------------------------AJOUT-------Utilisateur----------------
app.post('/accueilAdmin/adUtilisateurs', async (req, res) => {
    const [insertUtil] = await pool$.execute(`insert into utilisateurs (prenom_utilisateur,nom_utilisateur,adresse_utilisateur,mail_utilisateur,mdp_utilisateur,role_utilisateur) values(?,?,?,?,?,?)`, [req.body.PrenomUtil, req.body.NomUtil, req.body.adresseUtil, req.body.mailUtil, req.body.mdpUtil,req.body.roleUtil]);
    console.log(req.body.PrenomUtil, req.body.NomUtil, req.body.adresseUtil, req.body.mailUtil, req.body.mdpUtil,req.body.roleUtil);
    const [utilisateurs] = await pool$.execute('select * from utilisateurs')

    res.redirect('/accueilAdmin/adUtilisateurs')
})
//--------------------------MODIFIER------utilistaeur-----------------
app.get('/accueilAdmin/adMajUtil/:id', async (req, res) => {
    const [[recupUtil]] = await pool$.execute(`select * FROM utilisateurs WHERE id_utilisateur=?`, [req.params.id],);
    // console.log(recupUtil);
    res.render('viewsAdmin/adMajUtil', {
        title: 'Maj',
        majUtil: recupUtil,
        utilConnected : utilConnected,
    })
});

app.post('/accueilAdmin/adMajUtil/:id', async (req, res) => {
    const [majUtil] = await pool$.execute(`update utilisateurs set prenom_utilisateur=?,nom_utilisateur=?,adresse_utilisateur=?,mail_utilisateur=?,mdp_utilisateur=?,role_utilisateur where id_utilisateur = ? `, [req.body.PrenomUtil, req.body.NomUtil, req.body.adresseUtil, req.body.mailUtil, req.body.mdpUtil,req.body.roleUtil, req.params.id]);
    
    res.redirect('/accueilAdmin/adUtilisateurs')
});

//--------------------------DELETE---------Utilisateur-------------
app.get('/accueilAdmin/adUtilisateurs/:id', async (req, res) => {
    const [deleteUtil] = await pool$.execute(`delete from utilisateurs WHERE id_utilisateur=?`, [req.params.id])
    res.redirect('/accueilAdmin/adUtilisateurs')
});

//--------------------AFFICHER CLIENTS----------------------------


app.get('/accueilAdmin/Clients', async (req, res) => {
    const [clients] = await pool$.execute(`SELECT * FROM utilisateurs WHERE role_utilisateur='client'`)
    console.log(clients);
    res.render('viewsAdmin/adClients', {
        title: 'CLIENTS',
        clients: clients,
        utilConnected : utilConnected,
    })
})

//--------------------AFFICHER Livreur----------------------------

app.get('/accueilAdmin/Livreurs', async (req, res) => {
    const [livreurs] = await pool$.execute(`SELECT * FROM utilisateurs WHERE role_utilisateur='livreur'`)
    console.log(livreurs);
    res.render('viewsAdmin/adLivreurs', {
        title: 'CLIENTS',
        livreurs : livreurs,
        utilConnected : utilConnected,
    })
})
//--------------------AFFICHER Commande----------------------------

app.get('/accueilAdmin/Commandes', async (req, res) => {
    res.render('viewsAdmin/adCommandes', {
        utilConnected : utilConnected,
     title:''
    })
})

// __________________ROUTE_______UTILISATEUR_____________________________

app.get('/accueilClient', async (req, res) => {
    res.render('viewsUtil/pizzeriaWeb', {
      
    })
})

app.get('/accueilClient/pizzas', async (req, res) => {
    const [displayPizza] = await pool$.execute('select * from pizzas')
    console.log(req.params.id);
    res.render('viewsUtil/clipizzas', {   
        pizzas: displayPizza,
    })
})

app.post('/accueilClient/pizzas', async (req, res) => {
    const [displayPizza] = await pool$.execute('select * from pizzas')
    console.log(req.body.id_pizza);
    res.render('viewsUtil/clipizzas', {
     pizzas: displayPizza,
    })
})

app.get('/accueilClient', async (req, res) => {
    res.render('viewsUtil/pizzeriaWeb', {     
    })
})

app.post('/accueilClient/pizzas', async (req, res) => { 
    console.log(req.body.id_pizza);
    res.render('viewsUtil/clipizzas', {
     pizzas: displayPizza,
    })
})

//----------------------------Inscri---------------------------------


app.get('/accueilClient/MonCompte', async (req, res) => {
    res.render('viewsUtil/pizzeriaWeb', {
      
    })
})  

// app.post('/accueilClient/MonCompte', async (req, res) => {
//     const [insertClient] = await pool$.execute(`insert into utilisateurs (prenom_utilisateur,nom_utilisateur,adresse_utilisateur,mail_utilisateur,mdp_utilisateur,role_utilisateur) values(?,?,?,?,?,?)`, [req.body.prenomClient, req.body.nomClient, req.body.adresseClient, req.body.mailClient, req.body.mdpClient,'client']);

//     res.redirect('viewsUtil/pizzeriaWeb')
   
// })


// app.post('/accueilClient/panier/:id', async (req, res) => {
//     const [[recupPizza]] = await pool$.execute(`select * FROM pizza WHERE id_pizza=?`, [req.params.id],);
//     console.log([recupPizza]);
//     log(req.params.id)
//     res.render('viewsUtil/clipanier', {
//         title: 'PANIER',
//         recupPizzas : recupPizza 
//     })
// })

// _______________________CONNEXION___________________________________________

app.get('/accueilAdmin/connection', async (req, res) => {
    res.render('viewsAdmin/adminApp', {
        utilConnected : utilConnected,
    })
})

app.post('/accueilAdmin/connection', async (req, res) => {
    const recupMail = req.body.mail;
    const recupMdp = req.body.mdp;
    console.log(recupMail);
    console.log(recupMdp);
    const [[util]] = await pool$.execute(`SELECT * FROM utilisateurs WHERE mail_utilisateur=?`,[recupMail])
    console.log(util);
    if (util.mdp_utilisateur === recupMdp){
        utilConnected = util
    }
      res.redirect('/accueilAdmin/connection')
})
  
app.get('/accueilAdmin/deconnection', async (req, res) => {
    utilConnected = null
    res.redirect('/accueilAdmin/connection');
})



io.on('connection', socket => {
  console.log('un client vient de se connecter avec socket.id=', socket.id)
  socket.emit('client:connecte:ok');
  });





//_________________________________________________________________________________________

server.listen('4000', () => {
    console.log('Started 4000!')
})
















































// app.get('/accueilAdmin/Clients', async (req, res) => {
//     const [rowsClient] = await pool$.execute('select * from clients')
//     res.render('viewsAdmin/adClients', {
//         clients: rowsClient,
//     })
// })

// app.get('/accueilAdmin/Commandes', async (req, res) => {
//     res.render('viewsAdmin/adClients', {

//     })
// })

// app.get('/accueilAdmin/Livreurs', async (req, res) => {
//     const [rowsLivreur] = await pool$.execute('select * from livreurs')
//     res.render('viewsAdmin/Livreurs', {
//        livreurs : rowsLivreur
//     })
// })

// app.get('/accueilAdmin/Livreurs/Ingredients', async (req, res) => {
//     res.render('viewsAdmin/Ingredients', {

//     })
// })

// app.get('/accueilAdmin/Livreurs/Statistiques', async (req, res) => {
//     res.render('viewsAdmin/adStatistiques', {

//     })
// })

// app.get('/accueilAdmin/Livreurs/Promotions', async (req, res) => {
//     res.render('viewsAdmin/adPromotions', {

//     })
// })

// _______________________ROUTE_________CLIENTS_____________________________


// app.get('/accueilClient', async (req, res) => {
//     const [displayPizza] = await pool$.execute('select * from pizzas')

//     res.render('viewsUtil/pizzeriaWeb', {
//         pizzas : displayPizza,

//     })
// })

// app.get('/accueilClient/Panier/:id', async(req, res) => {
//     const [[recupPizza]] = await pool$.execute(`select * FROM pizzas WHERE id=?`,[req.body.id]);
//     console.log(req.body.id);
//         res.render('viewsUtil/cliPanier', {
//             title: 'Panier',
//             recupPizza : recupPizza,
//             })
//     });



//     app.post('/accueilClient/Panier/:id', async(req, res) => {

//     });



// app.get('/accueilClient/Menus', async (req, res) => {
//     res.render('viewsUtil/cliMenu', {

//     })
// })

// app.get('/accueilClient/Entrées', async (req, res) => {
//     res.render('viewsUtil/cliEntrées', {

//     })
// })

// app.get('/accueilClient/Pizzas', async (req, res) => {
//     const [rowsPizza] = await pool$.execute('select * from pizzas')
//     res.render('viewsUtil/cliPizzas', {
//        pizzas : rowsPizza
//     })
// })


// app.get('/accueilClient/Desserts', async (req, res) => {
//     res.render('viewsUtil/cliDesserts', {

//     })
// })

// app.get('/accueilClient/Boissons', async (req, res) => {

//     res.render('viewsUtil/Boissons', {

//     })
// })

