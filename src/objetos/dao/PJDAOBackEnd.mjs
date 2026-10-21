// src/objetos/dao/PJDAOBackEnd.mjs

export default class PJDAO {

    constructor() {
      this.baseUrl = "https://backend-pessoas.vercel.app/pj";
      this.cache = [];
      this.cacheCarregado = false;
    }
  
    // Consulta os registros no backend
    async carregarLista() {
  
      const resposta = await fetch(this.baseUrl);
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao listar PJs: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
  
      if (!Array.isArray(dados)) {
        throw new Error(
          "Formato inesperado na consulta de PJs."
        );
      }
  
      this.cache = dados.map((pj) => this.mapPJ(pj));
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
  
    // Cadastra uma Pessoa Jurídica
    async salvar(pj) {
  
      const objeto = this.toPlain(pj);
  
      const resposta = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(objeto)
      });
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao salvar PJ: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
      const novaPJ = this.mapPJ(dados);
  
      this.cache.push(novaPJ);
  
      return novaPJ;
    }
  
    // Atualiza uma Pessoa Jurídica
    async atualizar(id, pj) {
  
      const objeto = this.toPlain(pj);
  
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
          `Erro ao atualizar PJ: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
      const atualizada = this.mapPJ(dados);
  
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
  
    // Exclui uma Pessoa Jurídica
    async excluir(id) {
  
      const resposta = await fetch(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        {
          method: "DELETE"
        }
      );
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao excluir PJ: ${resposta.status}`
        );
      }
  
      this.cache = this.cache.filter(
        (pessoa) => pessoa.id !== id
      );
  
      return true;
    }
  
    // Busca uma Pessoa Jurídica pelo identificador
    async buscarPorId(id) {
  
      const existente = this.cache.find(
        (pessoa) => pessoa.id === id
      );
  
      if (existente) {
        return existente;
      }
  
      const resposta = await fetch(
        `${this.baseUrl}/${encodeURIComponent(id)}`
      );
  
      if (resposta.status === 404) {
        return null;
      }
  
      if (!resposta.ok) {
        throw new Error(
          `Erro ao buscar PJ: ${resposta.status}`
        );
      }
  
      const dados = await resposta.json();
      const pessoa = this.mapPJ(dados);
  
      this.cache.push(pessoa);
  
      return pessoa;
    }
  
    // Converte JSON recebido em estrutura utilizada no frontend
    mapPJ(pj) {
  
      return {
        id: pj._id,
        nome: pj.nome,
        email: pj.email,
        cnpj: pj.cnpj,
  
        endereco: pj.endereco
          ? {
              cep: pj.endereco.cep,
              logradouro: pj.endereco.logradouro,
              bairro: pj.endereco.bairro,
              cidade: pj.endereco.cidade,
              uf: pj.endereco.uf,
              regiao: pj.endereco.regiao
            }
          : {},
  
        telefones: (pj.telefones || []).map(
          (telefone) => ({
            ddd: telefone.ddd,
            numero: telefone.numero
          })
        ),
  
        ie: pj.ie
          ? {
              numero: pj.ie.numero,
              estado: pj.ie.estado,
              dataRegistro: pj.ie.dataRegistro
            }
          : {}
      };
    }
  
    // Converte objeto PJ em estrutura JSON
    toPlain(pj) {
  
      if (!pj) {
        return {};
      }
  
      const endereco = pj.getEndereco?.();
      const ie = pj.getIE?.();
      const telefones = pj.getTelefones?.() || [];
  
      return {
        nome: pj.getNome?.(),
        email: pj.getEmail?.(),
        cnpj: pj.getCNPJ?.(),
  
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
  
        ie: ie
          ? {
              numero: ie.getNumero?.(),
              estado: ie.getEstado?.(),
              dataRegistro: ie.getDataRegistro?.()
            }
          : {}
      };
    }
  
  }