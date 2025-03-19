import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './Pages/Login';

function App() {
  return (
    <div className="App">
      <Router>
        <nav>
          <Link to="/login">Login</Link>
        </nav>
        <Switch>
          <Route path="/login" component={Login} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
