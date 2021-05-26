import React, { useEffect, useState } from 'react';
import { Route, Switch, Redirect, useHistory, withRouter } from 'react-router-dom';
import '../index.css';
import Main from '../components/Main.js';
import Footer from '../components/Footer.js';
import ImagePopup from './ImagePopup.js';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from "./AddPlacePopup";
import InfoTooltip from "./InfoTooltip";
import Register from "./Register";
import Login from "./Login";
import ProtectedRoute from './ProtectedRoute'; 
import { api } from '../utils/api';
import { register, authorize, getContent } from '../utils/auth';
import {CurrentUserContext} from '../contexts/CurrentUserContext';


function App() {
    
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);

    function onEditProfile() {
        setIsEditProfilePopupOpen(true);
    }

    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);

    function onAddPlace() {
        setIsAddPlacePopupOpen(true);
    }

    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);

    function onEditAvatar() {
        setIsEditAvatarPopupOpen(true);
    }

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    function onInfoTooltip() {
        setIsInfoTooltipOpen(true);
    }

    const [isRequestSuccessful, setRequestSuccessful] = useState(false);

    function closeInfoTooltip() {
        setIsInfoTooltipOpen(false);
        if (isRequestSuccessful) {
            history.push('/singin');
        }
    }

    const [selectedCard, setSelectedCard] = useState(null);

    function handleCardClick(card) {
        setSelectedCard(card)
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false)
        setIsAddPlacePopupOpen(false)
        setIsEditAvatarPopupOpen(false)
        setSelectedCard(null)
    }
    
    const [currentUser, setCurrentUser] = useState('');

    function handleUpdateUser(data) {
        api.patchUserData(data)
            .then((userData) => {
                setCurrentUser(userData);
                closeAllPopups();
            })
            .catch(err => {
                console.log(err)
            })
    }

    function handleUpdateAvatar(userAvatar) {
        api.patchUserAvatar(userAvatar)
            .then((userData) => {
                setCurrentUser(userData);
                closeAllPopups();
            })
            .catch(err => {
                console.log(err)
            })
    }

    const [cards, setCards] = useState([]);

    function handleCardLike(card) {
        
        const isLiked = card.likes.some(i => i === currentUser.data._id);

        api.changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                const newCards = cards.map((c) => c._id === card._id ? newCard.data : c);
                setCards(newCards);
            })
            .catch(err => {
                console.log(err)
            })
    }

    function handleCardDelete(card) {
        api.deleteCard(card._id)
            .then(() => {
                const newCards = cards.filter((c) => c._id !== card._id);
                setCards(newCards);
            })
            .catch(err => {
                console.log(err)
            })
    }

    function handleAddPlaceSubmit(data) {
        api.postCard(data)
            .then((newCard) => {
                setCards([newCard.data, ...cards]);
                closeAllPopups();
            })
            .catch(err => {
                console.log(err)
            })
    }

    const [loggedIn, setLoggedIn] = useState(false);

    const history = useHistory();

    const handleRegister = (data) => {
        const { email, password } = data;
        return register(email, password)
            .then((res) => {
                if (!res || res.statusCode === 400) {
                    throw new Error('Что-то не так с регистрацией');
                }
                if (res) {
                    setRequestSuccessful(true);
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const handleLogin = (data) => {
        const { email, password } = data;
        return authorize(email, password)
            .then((res) => {
                if (!res || res.statusCode === 401) {
                    setIsInfoTooltipOpen(true)
                    throw new Error('Пользователь не зарегесрирован');
                }
                if (!res || res.statusCode === 400) {
                    setIsInfoTooltipOpen(true)
                    throw new Error('Не передано одно из полей ');
                }
                if (res.token) {
                    setRequestSuccessful(true);
                    localStorage.setItem('jwt', res.token);
                    api.setToken(res.token);
                    getContent(res.token)
                        .then((res) => {
                            if (res){
                            setLoggedIn(true);
                            setLoginData(res.data);
                            setCurrentUser(res);
                            history.push('/');
                            }
                        });
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        if (loggedIn) {
            Promise.all([api.getInitialCards(), api.getUserData()])
            .then(([cardData, userData]) => {
                setCurrentUser(userData);
                setCards(cardData.data);
            })
            .catch(err => {
                console.log(err)
            })
            history.push('/');
        }
    }, [history, loggedIn])

    const [loginData, setLoginData] = useState({
        _id: '',
        email: ''
    })

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (jwt) {
            api.setToken(jwt);
            getContent(jwt)
            .then((res) => {
                if (res){
                    setLoggedIn(true);
                    setLoginData(res.data);
                }
            })
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('jwt');
        setLoggedIn(false);
        setRequestSuccessful(false);
    }


    return (
    <CurrentUserContext.Provider value={currentUser}>
    <div className="page">
        <Switch>
            <ProtectedRoute exact path="/" loggedIn={loggedIn} component={Main}
                            onEditProfile={onEditProfile} 
                            onAddPlace={onAddPlace} 
                            onEditAvatar={onEditAvatar} 
                            onCardClick={handleCardClick}
                            cards={cards} 
                            onCardLike={handleCardLike}
                            onCardDelete={handleCardDelete}
                            onSignOut={handleSignOut}
                            loginData={loginData.email} />
            <Route path="/signup">
                <Register onRegister={handleRegister} onInfoTooltip={onInfoTooltip}/>
            </Route>
            <Route path="/signin">
                <Login onLogin={handleLogin} />
            </Route>
            <Route>
                {loggedIn ? <Redirect to="/" /> : <Redirect to="/signin" />}
            </Route> 
        </Switch>
        <Footer />
        <EditAvatarPopup    isOpen={isEditAvatarPopupOpen} 
                            onClose={closeAllPopups} 
                            onUpdateAvatar={handleUpdateAvatar} />
        <EditProfilePopup   isOpen={isEditProfilePopupOpen} 
                            onClose={closeAllPopups} 
                            onUpdateUser={handleUpdateUser} />
        <AddPlacePopup  isOpen={isAddPlacePopupOpen} 
                        onClose={closeAllPopups} 
                        onAddPlace={handleAddPlaceSubmit} />
        <ImagePopup card={selectedCard}
                    onClose={closeAllPopups} />
        <InfoTooltip    isOpen={isInfoTooltipOpen} 
                        onClose={closeInfoTooltip}
                        isRequestSuccessful={isRequestSuccessful} />
    </div>
    </CurrentUserContext.Provider>
  );
}

export default withRouter(App);
