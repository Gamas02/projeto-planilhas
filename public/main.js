let currentUser = null;
let produtos = [
  { id: 1, nome: "Produto 1", preco: 29.90 },
  { id: 2, nome: "Produto 2", preco: 49.90 },
  { id: 3, nome: "Produto 3", preco: 79.90 },
  { id: 4, nome: "Produto 4", preco: 99.90 },
  { id: 5, nome: "Produto 5", preco: 19.90 }
];
let carrinho = []; // carrinho do cliente

// Alternar telas
function showRegister(){
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}
function showLogin(){
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// Cadastro
function register(){
  const email=document.getElementById("regEmail").value;
  const senha=document.getElementById("regSenha").value;
  const role=document.getElementById("regRole").value;
  if(!email || !senha){alert("Preencha todos os campos!");return;}
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  if(users.find(u=>u.email===email)){alert("Usuário já existe!");return;}
  users.push({email,senha,role});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Cadastro realizado com sucesso!");
  showLogin();
}

// Login
function login(){
  const email=document.getElementById("loginEmail").value;
  const senha=document.getElementById("loginSenha").value;
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  const user=users.find(u=>u.email===email && u.senha===senha);
  if(!user){alert("Email ou senha inválidos!");return;}
  currentUser=user;
  carrinho = []; // limpa o carrinho ao logar
  document.body.classList.remove("login-page");
  document.body.classList.add("panel-page");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("panelPage").classList.remove("hidden");
  atualizarMenu();
  showSection("home");
}

// Logout
function logout(){
  currentUser=null;
  carrinho=[];
  document.body.classList.add("login-page");
  document.body.classList.remove("panel-page");
  document.getElementById("panelPage").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// Atualizar menu conforme tipo de usuário
function atualizarMenu(){
  const btnCarrinho = document.getElementById("btnCarrinho");
  const btnRelatorios = document.getElementById("btnRelatorios");
  if(currentUser.role==="cliente"){
    btnCarrinho.style.display="block";
    btnRelatorios.style.display="none";
  } else if(currentUser.role==="admin"){
    btnCarrinho.style.display="none";
    btnRelatorios.style.display="block";
  } else {
    btnCarrinho.style.display="none";
    btnRelatorios.style.display="none";
  }
}

// Registrar uma compra no sistema
function registrarCompra(compra) {
  let compras = JSON.parse(localStorage.getItem("compras") || "[]");
  compras.push(compra);
  localStorage.setItem("compras", JSON.stringify(compras));
}

// Calcular total do carrinho
function calcularTotal() {
  return carrinho.reduce((total, item) => total + item.preco, 0).toFixed(2);
}

// Seções do painel
function showSection(section){
  const main=document.getElementById("mainContent");
  main.innerHTML="";
  if(section==="home"){
    main.innerHTML=`<h2>Bem-vindo, ${currentUser.role}</h2>`;
  }
  if(section==="loja"){
    main.innerHTML="<h2>Loja</h2>";
    produtos.forEach(prod=>{
      const div=document.createElement("div");
      div.className="produto-card";
      div.innerHTML=`
        <p><strong>${prod.nome}</strong></p>
        <p>R$ ${prod.preco.toFixed(2)}</p>
      `;
      if(currentUser.role==="cliente"){
        const btn=document.createElement("button");
        btn.textContent="Adicionar ao carrinho";
        btn.onclick=()=>{
          carrinho.push(prod);
          alert(`${prod.nome} adicionado ao carrinho!`);
        };
        div.appendChild(btn);
      }
      main.appendChild(div);
    });
  }
  if(section==="carrinho" && currentUser.role==="cliente"){
    main.innerHTML="<h2>Carrinho</h2>";
    if(carrinho.length===0){
      main.innerHTML+="<p>Seu carrinho está vazio.</p>";
    } else {
      carrinho.forEach((item,i)=>{
        const div=document.createElement("div");
        div.className="produto-card";
        div.innerHTML=`
          <div class="produto-info">
            <span>${item.nome}</span>
            <span>R$ ${item.preco.toFixed(2)}</span>
          </div>
        `;
        const btnRemover=document.createElement("button");
        btnRemover.textContent="Remover";
        btnRemover.onclick=()=>{
          carrinho.splice(i,1);
          showSection("carrinho");
        };
        div.appendChild(btnRemover);
        main.appendChild(div);
      });
      
      const totalDiv = document.createElement("div");
      totalDiv.className = "produto-card";
      totalDiv.innerHTML = `<p><strong>Total: R$ ${calcularTotal()}</strong></p>`;
      main.appendChild(totalDiv);
      
      const btnFinalizar=document.createElement("button");
      btnFinalizar.className="btn";
      btnFinalizar.textContent="Finalizar Compra";
      btnFinalizar.onclick=()=>{
        // Registrar a compra
        const compra = {
          id: Date.now(),
          cliente: currentUser.email,
          data: new Date().toLocaleString('pt-BR'),
          itens: [...carrinho],
          total: calcularTotal()
        };
        
        registrarCompra(compra);
        alert("Compra finalizada com sucesso!");
        carrinho=[];
        showSection("carrinho");
      };
      main.appendChild(btnFinalizar);
    }
  }
  if(section==="relatorios" && currentUser.role==="admin"){
    main.innerHTML="<h2>Relatórios de Compras</h2>";
    
    // Adicionar filtros
    const filtrosDiv = document.createElement("div");
    filtrosDiv.className = "filtros";
    filtrosDiv.innerHTML = `
      <select id="filtroCliente">
        <option value="">Todos os clientes</option>
      </select>
      <input type="date" id="filtroDataInicio" placeholder="Data início">
      <input type="date" id="filtroDataFim" placeholder="Data fim">
      <button class="btn" onclick="filtrarRelatorios()">Filtrar</button>
      <button class="btn" onclick="limparFiltros()">Limpar</button>
    `;
    main.appendChild(filtrosDiv);
    
    // Carregar clientes para o filtro
    carregarClientesFiltro();
    
    // Exibir relatórios
    exibirRelatorios();
  }
}

// Carregar clientes para o filtro
function carregarClientesFiltro() {
  const compras = JSON.parse(localStorage.getItem("compras") || "[]");
  const clientes = [...new Set(compras.map(compra => compra.cliente))];
  
  const selectCliente = document.getElementById("filtroCliente");
  clientes.forEach(cliente => {
    const option = document.createElement("option");
    option.value = cliente;
    option.textContent = cliente;
    selectCliente.appendChild(option);
  });
}

// Exibir relatórios
function exibirRelatorios() {
  const main = document.getElementById("mainContent");
  const compras = JSON.parse(localStorage.getItem("compras") || "[]");
  
  if (compras.length === 0) {
    main.innerHTML += "<p>Nenhuma compra registrada ainda.</p>";
    return;
  }
  
  // Aplicar filtros
  const clienteFiltro = document.getElementById("filtroCliente").value;
  const dataInicio = document.getElementById("filtroDataInicio").value;
  const dataFim = document.getElementById("filtroDataFim").value;
  
  let comprasFiltradas = compras;
  
  if (clienteFiltro) {
    comprasFiltradas = comprasFiltradas.filter(compra => compra.cliente === clienteFiltro);
  }
  
  if (dataInicio) {
    comprasFiltradas = comprasFiltradas.filter(compra => {
      const dataCompra = new Date(compra.data.split(',')[0].split('/').reverse().join('-'));
      const dataInicioFiltro = new Date(dataInicio);
      return dataCompra >= dataInicioFiltro;
    });
  }
  
  if (dataFim) {
    comprasFiltradas = comprasFiltradas.filter(compra => {
      const dataCompra = new Date(compra.data.split(',')[0].split('/').reverse().join('-'));
      const dataFimFiltro = new Date(dataFim);
      return dataCompra <= dataFimFiltro;
    });
  }
  
  // Exibir compras filtradas
  comprasFiltradas.forEach(compra => {
    const div = document.createElement("div");
    div.className = "relatorio-card";
    
    let itensHTML = "";
    compra.itens.forEach(item => {
      itensHTML += `<div class="produto-info"><span>${item.nome}</span><span>R$ ${item.preco.toFixed(2)}</span></div>`;
    });
    
    div.innerHTML = `
      <div class="relatorio-header">
        <span>Compra #${compra.id}</span>
        <span>${compra.data}</span>
      </div>
      <div class="relatorio-detalhes">
        <p><strong>Cliente:</strong> ${compra.cliente}</p>
        <p><strong>Itens:</strong></p>
        ${itensHTML}
      </div>
      <div class="relatorio-total">
        Total: R$ ${compra.total}
      </div>
    `;
    main.appendChild(div);
  });
  
  // Exibir estatísticas
  const totalVendas = comprasFiltradas.reduce((total, compra) => total + parseFloat(compra.total), 0);
  const totalCompras = comprasFiltradas.length;
  
  const statsDiv = document.createElement("div");
  statsDiv.className = "produto-card";
  statsDiv.innerHTML = `
    <h3>Estatísticas</h3>
    <p>Total de vendas: R$ ${totalVendas.toFixed(2)}</p>
    <p>Número de compras: ${totalCompras}</p>
    <p>Ticket médio: R$ ${totalCompras > 0 ? (totalVendas / totalCompras).toFixed(2) : '0.00'}</p>
  `;
  main.appendChild(statsDiv);
}

// Filtrar relatórios
function filtrarRelatorios() {
  showSection("relatorios");
}

// Limpar filtros
function limparFiltros() {
  document.getElementById("filtroCliente").value = "";
  document.getElementById("filtroDataInicio").value = "";
  document.getElementById("filtroDataFim").value = "";
  showSection("relatorios");
}