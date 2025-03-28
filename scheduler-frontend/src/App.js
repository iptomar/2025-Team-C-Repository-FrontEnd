import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import CRUD from './Pages/CRUDInt';

function App() {
  return (
    <div className="App">
      <Router>
        <nav>
          {/* Ajustar o caminho do Link para corresponder à rota */}
          <Link to="/ApiCRUDInt">CRUD</Link>
        </nav>
        <Switch>
          {/* Ajustar o caminho da rota para corresponder ao Link */}
          <Route path="/ApiCRUDInt" component={CRUD} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;