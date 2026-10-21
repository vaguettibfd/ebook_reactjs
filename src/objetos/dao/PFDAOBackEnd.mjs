// src/objetos/dao/PFDAOBackEnd.mjs

export default class PFDAO {

    constructor() {
      this.baseUrl = "https://backend-pessoas.vercel.app/pf";
      this.cache = [];
      this.cacheCarregado = false;
    }
  
    // Consulta os registros no backend
    async carregarLista() {
  
      const resposta = await fetch(this.baseUrl);
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao listar PFs: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
  
      if (!Array.isArray(dados)) {
        throw new Error(
          "Formato inesperado na consulta de PFs."
        );
      }
  
      this.cache = dados.map((pf) => this.mapPF(pf));
      this.cacheCarregado = true;
  
      return [...this.cache];
    }
  
    // Retorna os registros disponíveis
    async listar() {
  
      if (!this.cacheCarregado) {
        return await this.carregarLista();
      }
  
      return [...this.cache];
    }
  
    // Cadastra uma Pessoa Física
    async salvar(pf) {
  
      const objeto = this.toPlain(pf);
  
      const resposta = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(objeto)
      });
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao salvar PF: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
      const novaPF = this.mapPF(dados);
  
      this.cache.push(novaPF);
  
      return novaPF;
    }
  
    // Atualiza uma Pessoa Física
    async atualizar(id, pf) {
  
      const objeto = this.toPlain(pf);
  
      const resposta = await fetch(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(objeto)
        }
      );
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao atualizar PF: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
      const atualizada = this.mapPF(dados);
  
      const indice = this.cache.findIndex(
        (pessoa) => pessoa.id === id
      );
  
      if (indice >= 0) {
        this.cache[indice] = atualizada;
      } else {
        this.cache.push(atualizada);
      }
  
      return atualizada;
    }
  
    // Exclui uma Pessoa Física
    async excluir(id) {
  
      const resposta = await fetch(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        {
          method: "DELETE"
        }
      );
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao excluir PF: ${resposta.status}`
        );
      }
  
      this.cache = this.cache.filter(
        (pessoa) => pessoa.id !== id
      );
  
      return true;
    }
  
    // Busca uma Pessoa Física pelo identificador
    async buscarPorId(id) {

        console.log("ID recebido:", id);
      
        // 1. Procura inicialmente no cache
        const existente = this.cache.find(
          (pessoa) => String(pessoa.id) === String(id)
        );
      
        if (existente) {
          return existente;
        }
      
        // 2. Se não encontrou, carrega a lista do backend
        const lista = await this.carregarLista();
      
        // 3. Procura o registro na lista carregada
        const pessoa = lista.find(
          (item) => String(item.id) === String(id)
        );
      
        // 4. Retorna o registro encontrado ou null
        return pessoa ?? null;
    }
    
    // Converte JSON recebido em estrutura utilizada no frontend
    mapPF(pf) {
  
      return {
        id: pf._id,
        nome: pf.nome,
        email: pf.email,
        cpf: pf.cpf,
  
        endereco: pf.endereco
          ? {
              cep: pf.endereco.cep,
              logradouro: pf.endereco.logradouro,
              bairro: pf.endereco.bairro,
              cidade: pf.endereco.cidade,
              uf: pf.endereco.uf,
              regiao: pf.endereco.regiao
            }
          : {},
  
        telefones: (pf.telefones || []).map(
          (telefone) => ({
            ddd: telefone.ddd,
            numero: telefone.numero
          })
        ),
  
        titulo: pf.titulo
          ? {
              numero: pf.titulo.numero,
              zona: pf.titulo.zona,
              secao: pf.titulo.secao
            }
          : {}
      };
    }
  
    // Converte objeto PF em estrutura JSON
    toPlain(pf) {
  
      if (!pf) {
        return {};
      }
  
      const endereco = pf.getEndereco?.();
      const titulo = pf.getTitulo?.();
      const telefones = pf.getTelefones?.() || [];
  
      return {
        nome: pf.getNome?.(),
        email: pf.getEmail?.(),
        cpf: pf.getCPF?.(),
  
        endereco: endereco
          ? {
              cep: endereco.getCep?.(),
              logradouro: endereco.getLogradouro?.(),
              bairro: endereco.getBairro?.(),
              cidade: endereco.getCidade?.(),
              uf: endereco.getUf?.(),
              regiao: endereco.getRegiao?.()
            }
          : {},
  
        telefones: telefones.map(
          (telefone) => ({
            ddd: telefone.getDdd?.(),
            numero: telefone.getNumero?.()
          })
        ),
  
        titulo: titulo
          ? {
              numero: titulo.getNumero?.(),
              zona: titulo.getZona?.(),
              secao: titulo.getSecao?.()
            }
          : {}
      };
    }
  
  }