import { newCardTemplate, trilloTemplate } from "./template";

import "./trillo.css"

export default class Trillo {

       static #trillo;
       static #activeList = false;       
      
    static init(container) {
        let a = trilloTemplate;
        container.insertAdjacentHTML('beforeend', a);
      this.#trillo = container.querySelector('.trillo');
        
        this.cardDeleteClick = this.cardDeleteClick.bind(this);
        this.cardAddClick = this.cardAddClick.bind(this);
        this.buttonAddCardClick = this.buttonAddCardClick.bind(this);
        this.buttonCancelCardClick = this.buttonCancelCardClick.bind(this);
        this.cardMouseDown = this.cardMouseDown.bind(this);
                
        document.addEventListener('click', this.cardDeleteClick);
        document.addEventListener('click', this.cardAddClick);
        document.addEventListener('click', this.buttonAddCardClick);
        document.addEventListener('click', this.buttonCancelCardClick);
        document.addEventListener('mousedown', this.cardMouseDown);
        window.addEventListener('beforeunload', this.toLocalStorage)

        this.fromLocalStorage();
    }

    static cardDeleteClick(event) {
        if(event.target.classList.contains('card-delete') && !this.#activeList) {
            event.target.parentElement.remove();
        }
    }

    static cardAddClick(event) {
        if(!event.target.classList.contains('add-card-button')) {
            return;
        }

        const newCard = this.#trillo.querySelector('.new-card');
        const newCardClone = newCard.cloneNode(true);

        if(this.#activeList) {
            return;
        }
        
        this.#activeList = event.target.previousElementSibling;
        this.#activeList.append(newCardClone);
        const buttonRect = event.target.getBoundingClientRect();
        newCardClone.style.height = buttonRect.height * 5 + 'px';
        newCardClone.style.width = '100%';
        newCardClone.style.display = 'flex';
        this.#activeList.scrollTop = this.#activeList.scrollHeight;
        newCardClone.querySelector('.textarea').focus();
        


    }

    static buttonAddCardClick(event) {
        if(event.target.classList.contains('button-ok')) {
            const addCard = this.#activeList.querySelector('.new-card');
            const text = addCard.firstElementChild.value;
            addCard.remove();
            const newCard = newCardTemplate.replace('><', '>' + text + '<');           
            this.#activeList.insertAdjacentHTML('beforeend', newCard)
            this.#activeList = false;
        }
    }

    static buttonCancelCardClick(event) {
        if(event.target.classList.contains('button-cancel')) {
            const addCard = this.#activeList.querySelector('.new-card');
            addCard.remove();
            this.#activeList = false;
        }
    }

    static cardMouseDown(event) {

        if(!event.target.classList.contains('card') || this.#activeList) {
            return;
        }

        event.preventDefault();

        const card = event.target;
        
        const cardTemp = card.cloneNode(true);
        cardTemp.querySelector('.card-delete').style.display = 'none';

        card.style.opacity = 0.3;
        card.classList.add('draggable');

        const cardRect = card.getBoundingClientRect();
        
        cardTemp.style.position = 'absolute';

        cardTemp.style.left = cardRect.left + 'px';
        cardTemp.style.top = cardRect.top + 'px';
        cardTemp.style.width = cardRect.width + 'px';
        cardTemp.style.height = cardRect.height + 'px';
        cardTemp.style.marginTop = 0;
        cardTemp.style.zIndex = 1000;
        cardTemp.style.transform = 'rotate(0.01turn)'
        cardTemp.style.cursor = 'grabbing';
       
        document.body.append(cardTemp);
    
        const shiftX = event.pageX - card.getBoundingClientRect().left;
        const shiftY = event.pageY - card.getBoundingClientRect().top;
    
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        function onMouseMove(event) {
            move(event.pageX, event.pageY);
            cardTemp.style.display = 'none';
            const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            cardTemp.style.display = 'flex';
            let elemBelowRect;
            try {
                elemBelowRect = elemBelow.getBoundingClientRect();
            }
            catch {
                return;
            }

            if(elemBelow.classList.contains('draggable')) {
                return;
            }

            if(elemBelow.classList.contains('card')) {

                if(elemBelowRect.top + (elemBelowRect.height / 2) > event.clientY){
                    elemBelow.before(card);
                }
                else {
                    elemBelow.after(card);
                }

                return;  
            }

            let elemBelowTemp;
            
            if(elemBelow.classList.contains('cards-list') || elemBelow.classList.contains('colums')) {

                const elemBelowCenterX = elemBelowRect.left + (elemBelowRect.width / 2);
                
                cardTemp.style.display = 'none';
                elemBelowTemp = document.elementFromPoint(elemBelowCenterX, event.clientY);
                cardTemp.style.display = 'flex';

                if(elemBelowTemp.classList.contains('card')) {
                    const elemBelowTempRect = elemBelowTemp.getBoundingClientRect();
                    if(elemBelowTempRect.top + (elemBelowTempRect.height / 2) > event.clientY){
                        elemBelowTemp.before(card);
                    }
                    else {
                        elemBelowTemp.after(card);
                    }
    
                    return; 

                }
                else {
                    cardTemp.style.display = 'none';
                    elemBelowTemp = document.elementFromPoint(elemBelowCenterX, event.clientY - 20);
                    cardTemp.style.display = 'flex';
                    try {
                        if(elemBelowTemp.classList.contains('card')) {
                            elemBelowTemp.after(card);
                            return;
                        }
                    }
                    catch {
                        elemBelow.classList.contains('colums') ? elemBelow.querySelector('.cards-list').prepend(card) : elemBelow.prepend(card);
                        return;
                    }

                    cardTemp.style.display = 'none';
                    elemBelowTemp = document.elementFromPoint(elemBelowCenterX, event.clientY + 20);
                    cardTemp.style.display = 'flex';
                    try {
                        if(elemBelowTemp.classList.contains('card')) {
                            elemBelowTemp.before(card);
                            return;
                        }

                    }
                    catch {
                        elemBelow.classList.contains('colums') ? elemBelow.querySelector('.cards-list').append(card) : elemBelow.append(card);
                        return;
                    }
                    

                }

                if(elemBelow.classList.contains('colums')) {
                    elemBelow.querySelector('.cards-list').append(card);
                }
                else {
                    elemBelow.append(card);
                }
                return;
            }
            
            if(elemBelow.classList.contains('trillo') || elemBelow.classList.contains('add-card-button')){

                const trilloRect = Trillo.#trillo.getBoundingClientRect();
                cardTemp.style.display = 'none';
                elemBelowTemp = document.elementFromPoint(event.clientX, trilloRect.top + 16);
                cardTemp.style.display = 'flex';

                if(elemBelowTemp.classList.contains('cards-list')) {
                    event.clientY - trilloRect.top < 10 ? elemBelowTemp.prepend(card) : elemBelowTemp.append(card);
                }

            }

        }
        
        function move (x, y) {
            cardTemp.style.left = x - shiftX + 'px';
            cardTemp.style.top = y - shiftY + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            cardTemp.remove();
            card.style.opacity = 1;
            card.classList.remove('draggable');
        }
    }


    

    static toLocalStorage() {
        
        const storage = {};
        const cardLists = [...Trillo.#trillo.querySelectorAll('.cards-list')];
        let counter = 0;
        cardLists.forEach(list => {
            counter += 1;
            storage['list' + counter] = [];
            const cards = [...list.querySelectorAll('.card')];
            cards.forEach(card => {
                storage['list' + counter].push(card.innerHTML);
            });
        });
        
        window.localStorage.setItem('cards', JSON.stringify(storage));
        
        return true;
    }

    static fromLocalStorage() {
        const storage = JSON.parse(window.localStorage.getItem('cards'));
        if(!storage) {
            return true;
        }
    
        const cardLists = [...this.#trillo.querySelectorAll('.cards-list')];

        let counter = 0;
        for(let key in storage) {
            const cards = storage[key];
            cards.forEach(card => {
                const newCard = newCardTemplate.replace('<div class="card-delete"></div>', card);
                cardLists[counter].insertAdjacentHTML('beforeend', newCard);
            });    
        
        counter += 1;
        }
        return true;
    }
}
