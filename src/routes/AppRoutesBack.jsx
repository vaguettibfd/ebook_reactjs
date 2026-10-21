// src/routes/AppRoutesBack.jsx

import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout.jsx";

import PessoaFormBack from "../components/cadastrapessoa/PessoaFormBack.jsx";

import ListaPessoasBack from "../components/listapessoas/ListaPessoasBack.jsx";

import VisualizarPessoaBack from  "../components/visualizapessoa/VisualizarPessoaBack.jsx";

export default function AppRoutesBack() {

  return (

    <Routes>

      {/* Rotas que utilizam o layout principal */}

      <Route
        path="/"
        element={<MainLayout />}
      >

        {/* Redirecionamento da página inicial */}

        <Route
          index
          element={
            <Navigate
              to="cadastrar"
              replace
            />
          }
        />

        {/* Cadastro de PF e PJ */}

        <Route
          path="cadastrar"
          element={<PessoaFormBack />}
        />

        {/* Listagem de pessoas */}

        <Route
          path="listar"
          element={<ListaPessoasBack />}
        />

        {/* Visualização detalhada */}

        <Route
          path="visualizar/:tipo/:id"
          element={<VisualizarPessoaBack />}
        />

        {/* Edição de cadastro */}

        <Route
          path="editar/:tipo/:id"
          element={<PessoaFormBack />}
        />

      </Route>

    </Routes>

  );

}