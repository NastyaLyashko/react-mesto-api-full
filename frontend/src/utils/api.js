class Api {
    constructor({baseUrl, headers},) {
        this.headers = headers;
        this.baseUrl = baseUrl;
    }

    setToken(jwt) {
        this.headers.authorization = `Bearer ${jwt}`;
      }
  
    getInitialCards() {
        return fetch(`${this.baseUrl}/cards`, {
            headers: this.headers
        })
        .then(res => {
            if (res.ok) {
            return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
        })
    } 
    
    getUserData() {
        return fetch (`${this.baseUrl}/users/me`, {
            headers: this.headers
        })

        .then(res => {
            if (res.ok) {
              return res.json();
            } else {
                return Promise.reject(`Ошибка: ${res.status}`);
            }
        })

    }

    patchUserData(item) {
        return fetch(`${this.baseUrl}/users/me`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({
                name: item.name,
                about: item.about
           })

        })
        .then(res => {
            if (res.ok) {
              return res.json();
            } else {
                return Promise.reject(`Ошибка: ${res.status}`);
            }
        })
        .then((res) => {
            return res;
        })
    }

    postCard(item) {
        return fetch(`${this.baseUrl}/cards`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name: item.name,
                link: item.link
           })
        })   
        .then(res => {
            if (res.ok) {
              return res.json();
            }
      
            return Promise.reject(`Ошибка: ${res.status}`);
        })
        .then((res) => {
            return res;
        })

    }

    
    patchUserAvatar(userAvatar) {
        return fetch(`${this.baseUrl}/users/me/avatar `, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(userAvatar)
        })
        .then(res => {
            if (res.ok) {
              return res.json();
            } 
            return Promise.reject(`Ошибка: ${res.status}`);
        })
    }

    deleteCard(idCard) {
        return fetch(`${this.baseUrl}/cards/${idCard}`, {
            method: 'DELETE',
            headers: this.headers,
            body: JSON.stringify({
                _id: idCard,
           })
        })   
        .then(res => {
            if (res.ok) {
              return res.json();
            }
      
            return Promise.reject(`Ошибка: ${res.status}`);
        })
    }

    putLike(idCard) {
        return fetch(`${this.baseUrl}/cards/${idCard}/likes`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify({
                _id: idCard,
           })
        })   
        .then(res => {
            if (res.ok) {
              return res.json();
            }
      
            return Promise.reject(`Ошибка: ${res.status}`);
        })
    }

    deleteLike(idCard) {
        return fetch(`${this.baseUrl}/cards/${idCard}/likes`, {
            method: 'DELETE',
            headers: this.headers,
            body: JSON.stringify({
                _id: idCard,
           })
        })   
        .then(res => {
            if (res.ok) {
              return res.json();
            }
      
            return Promise.reject(`Ошибка: ${res.status}`);
        })
    }

    changeLikeCardStatus(idCard, isLiked) {
        return !isLiked ? this.deleteLike(idCard) : this.putLike(idCard)
    }
}
  
export const api = new Api({
    baseUrl: 'https://api.lyashkoay.students.nomoredomains.icu',
    headers: {
        'authorization': `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json'
    }
  })