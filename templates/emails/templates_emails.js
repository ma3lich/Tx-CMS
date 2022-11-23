const app = require('../../config/app.json');

module.exports = {
  Login: `

  <style type="text/css">
  @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400;500;600;900&display=swap");

  body {
      margin: 0;
      font-family: "Noto Sans Mono", monospace;
      display: flex;
      justify-content: center;
      flex-direction: column;
      margin: auto;
      background: linear-gradient(145deg, #fff, #6670da1c);
      box-shadow: 5px 5px 15px rgba(#6670da, 0.5),
      -5px -5px 15px rgba(#6670da, 0.5);
  }
  h1 {
      text-align: center;
      color: #0c1669;
      padding: 5% 0 2% 0;
  }
  hr {
      border: 1px solid #6670da;
      background-color: #6670da;
      width: 100%;
  }
  span {
      color: rgb(12, 22, 105);
      font-weight: 600;
      font-size: 1.2rem;
  }
  .container {
      border-radius: 12px;
      padding: 5% 3%;
      width: 60%;
      margin: auto;
  }
  footer {
      margin: auto;
      font-size: 0.8rem;
  }

  .button {
      border-radius: 12px;
      padding: 2%;
      text-decoration: none;
      white-space: nowarp;
      min-width: 150px;
      text-align: center;
      display: flex;     
      justify-content: center;   
      align-items: center;   
  }
  
  .button a {
      padding: 8px;
      border-radius: 12px;
      font-family: Helvetica, Arial, sans-serif;
      font-size: 1rem;
      color: #ffffff; 
      text-decoration: none;
      font-weight: bold;
      display: flex;          
      text-align: center;
  }
  </style>
  <body>
  <h1>${app.config.company.name} - Espace client</h1>
  <hr />
  <div class="container">
      <span>Bonsoir !</span>
      <p>
      Vous avez reçu cet e-mail car nous avons détecté une nouvelle connexion à
      partir de votre compte.
      <br />
      <br />

      <table  style="margin:auto;">
          <tr>
              <td>
                  <table >
                      <tr>
                          <td class="button" bgcolor="#6770da">
                              <a  class=”link” href="https://${app.config.system.hostname}" target="_blank">
                                  C'est bien moi 
                              </a>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
      <br />
      Si vous n'êtes pas à l'origine de cette connexion nous vous conseillons de
      changer votre mot de passe juste
      <a href="https://${app.config.company.domaine}/reset/password">ici</a>.
      <br />
      <br />
      Cordialment,<br />
      ${app.config.company.name}
      </p>
  </div>
  <hr />
  <footer>
      <br />
      Copyright 2023 <a href="https://txcms.fr">TxCMS</a>, Tout droits réservé
  </footer>
  </body>
    `,
};
