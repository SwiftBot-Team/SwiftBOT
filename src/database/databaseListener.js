module.exports = class databaseListener {
  
  constructor(client) {
    this.client = client;
  };
  
  listen() {
    
    this.client.log(`[DATABASE LISTENER] Database Listner iniciado com sucesso.`);
    
    this.client.database.ref(`SwiftBOT/Servidores/`).on('child_changed', (d) => {
      
      const serverID = d.ref_.path.pieces_[d.ref_.path.pieces_.length - 1];
      
      this.client.log(`Server com ID ${serverID} teve suas informações alteradas.`);
      
      const { config } = d.val();
      
      this.client.prefixes.set(serverID, config.prefix);
      
      this.client.languages.set(serverID, config.lang);
    })
  }
}
