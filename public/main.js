// === CONFIGURAÇÕES ===
const API_BASE = "http://localhost:1880";

// === FUNÇÕES DO BANCO ===
async function getProdutos() {
  try {
    const response = await fetch(`${API_BASE}/get-produtos`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

async function saveCompra(compra) {
  try {
    const response = await fetch(`${API_BASE}/finalizar-compra`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compra)
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar compra:", error);
    return { error: "Erro de conexão" };
  }
}

async function getRelatorios() {
  try {
    const response = await fetch(`${API_BASE}/get-relatorios`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    return [];
  }
}

// === FUNÇÕES DE VALIDAÇÃO ===
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarSenha(senha) {
  return senha.length >= 6;
}

// === VARIÁVEIS GLOBAIS ===
let currentUser = null;
let produtos = [];
let carrinho = [];

// === FUNÇÕES DE TELA ===
function showRegister(){
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

function showLogin(){
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// === CADASTRO ===
async function register(){
  const email = document.getElementById("regEmail").value;
  const senha = document.getElementById("regSenha").value;
  const role = document.getElementById("regRole").value;
  
  if(!validarEmail(email)) {
    alert("Por favor, insira um email válido! \n exemplo@gmail.com");
    return;
  }
  
  if(!validarSenha(senha)) {
    alert("A senha deve ter pelo menos 6 caracteres!");
    return;
  }
  
  if(!email || !senha){
    alert("Preencha todos os campos!");
    return;
  }
  
  try {
    const resposta = await fetch(`${API_BASE}/auth-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha, role })
    });

    const resultado = await resposta.json();
    
    if(resposta.ok) {
      alert("Cadastro realizado com sucesso!");
      showLogin();
    } else {
      alert(resultado.error || "Erro no cadastro!");
    }
  } catch (erro) {
    alert("Erro de conexão: " + erro);
  }
}

// === LOGIN ===
async function login(){
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;
  
  if(!validarEmail(email)) {
    alert("Por favor, insira um email válido!");
    return;
  }
  
  try {
    const resposta = await fetch(`${API_BASE}/auth-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();
    
    if(resposta.ok) {
      currentUser = resultado.user;
      carrinho = [];
      await carregarProdutos();
      
      document.body.classList.remove("login-page");
      document.body.classList.add("panel-page");
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("registerForm").classList.add("hidden");
      document.getElementById("panelPage").classList.remove("hidden");
      atualizarMenu();
      showSection("home");
    } else {
      alert(resultado.error || "Email ou senha inválidos!");
    }
  } catch (erro) {
    alert("Erro de conexão: " + erro);
  }
}

// === LOGOUT ===
function logout(){
  currentUser = null;
  carrinho = [];
  document.body.classList.add("login-page");
  document.body.classList.remove("panel-page");
  document.getElementById("panelPage").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// === CARREGAR PRODUTOS ===
async function carregarProdutos() {
  try {
    produtos = await getProdutos();
    if (produtos.length === 0) {
      produtos = [
        { id: 1, nome: "Produto 1", preco: 29.90 },
        { id: 2, nome: "Produto 2", preco: 49.90 },
        { id: 3, nome: "Produto 3", preco: 79.90 },
        { id: 4, nome: "Produto 4", preco: 99.90 },
        { id: 5, nome: "Produto 5", preco: 19.90 }
      ];
    }
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    produtos = [
      { id: 1, nome: "Produto 1", preco: 29.90 },
      { id: 2, nome: "Produto 2", preco: 49.90 },
      { id: 3, nome: "Produto 3", preco: 79.90 }
    ];
  }
}

// === ATUALIZAR MENU ===
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

// === CALCULAR TOTAL ===
function calcularTotal() {
  return carrinho.reduce((total, item) => total + item.preco, 0).toFixed(2);
}

// === SEÇÕES DO PAINEL ===
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
      btnFinalizar.onclick=async ()=>{
        const compra = {
          id: Date.now(),
          cliente: currentUser.email,
          data: new Date().toLocaleString('pt-BR'),
          itens: [...carrinho],
          total: calcularTotal()
        };
        
        const resultado = await saveCompra(compra);
        if (!resultado.error) {
          alert("Compra finalizada com sucesso!");
          carrinho=[];
          showSection("carrinho");
        } else {
          alert("Erro: " + resultado.error);
        }
      };
      main.appendChild(btnFinalizar);
    }
  }
  
  if(section==="relatorios" && currentUser.role==="admin"){
    exibirRelatorios();
  }
}

// === EXIBIR RELATÓRIOS ===
async function exibirRelatorios() {
  const main = document.getElementById("mainContent");
  main.innerHTML = "<h2>Relatórios de Compras</h2>";
  
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
  
  try {
    const compras = await getRelatorios();
    
    if (!compras || compras.length === 0) {
      main.innerHTML += "<p>Nenhuma compra registrada ainda.</p>";
      return;
    }
    
    carregarClientesFiltro(compras);
    
    compras.forEach(compra => {
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
    
    const totalVendas = compras.reduce((total, compra) => total + parseFloat(compra.total), 0);
    const totalCompras = compras.length;
    
    const statsDiv = document.createElement("div");
    statsDiv.className = "produto-card";
    statsDiv.innerHTML = `
      <h3>Estatísticas</h3>
      <p>Total de vendas: R$ ${totalVendas.toFixed(2)}</p>
      <p>Número de compras: ${totalCompras}</p>
      <p>Ticket médio: R$ ${totalCompras > 0 ? (totalVendas / totalCompras).toFixed(2) : '0.00'}</p>
    `;
    main.appendChild(statsDiv);
    
  } catch (erro) {
    main.innerHTML += `<p>Erro ao carregar relatórios: ${erro}</p>`;
  }
}

// === FUNÇÕES AUXILIARES ===
function carregarClientesFiltro(compras) {
  const clientes = [...new Set(compras.map(compra => compra.cliente))];
  const selectCliente = document.getElementById("filtroCliente");
  
  clientes.forEach(cliente => {
    const option = document.createElement("option");
    option.value = cliente;
    option.textContent = cliente;
    selectCliente.appendChild(option);
  });
}

function filtrarRelatorios() {
  showSection("relatorios");
}

function limparFiltros() {
  document.getElementById("filtroCliente").value = "";
  document.getElementById("filtroDataInicio").value = "";
  document.getElementById("filtroDataFim").value = "";
  showSection("relatorios");
}

async function enviarFinanceiro() {
  const nome = document.getElementById("nome").value;
  const cnpj = document.getElementById("cnpj").value;
  const faixa = document.getElementById("faixa").value;

  if (!nome || !cnpj || !faixa) {
    alert("Preencha todos os campos!");
    return;
  }

  const dados = { nome, cnpj, faixa };

  try {
    const resposta = await fetch("http://localhost:1880/insert-financeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.text();
    document.getElementById("resultado").innerText = resultado;
  } catch (erro) {
    document.getElementById("resultado").innerText = "Erro ao enviar: " + erro;
  }
}

console.log("Sistema carregado! Botões devem funcionar! 🚀");