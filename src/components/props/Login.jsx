import Label from './Label.jsx';
import Labelln from './Labelln.jsx';
import InputText from './InputText.jsx';
import Button from './Button.jsx';

function Login() {
  return (
    <>
      <Labelln texto="Login" />
      <Label texto="Usuário: " />
      <InputText placeholder="Digite o  login !!!" /> <br />
      <Label texto="Senha: " />
      <InputText placeholder="Digite a Senha !!!" /> <br />
      <Button valor="Logar" />
    </>
  );
}
export default Login;
