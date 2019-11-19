
(function app() {
    const btnDiv = document.querySelector('div.d-flex:nth-of-type(3)');
    const name = document.querySelector('#proname');
    const price = document.querySelector('#price');
    const seller = document.querySelector('#seller');

    let db
    let dbReq

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    dbReq = indexedDB.open('electronic-db', 1);

    dbReq.onsuccess = function (event) {
        db = event.target.result;
        console.log('Request successful')
    }

    dbReq.onerror = function (event) {
        console.error('error opening datatbase ' + event.target.errorCode)
    }

    dbReq.onupgradeneeded = function (event) {
        console.log(event.target.result)
        db = event.target.result
        let store

        console.log('Creating the product object store');
        if (!db.objectStoreNames.contains('electronic_store')) {
            store = db.createObjectStore('electronic_store', { autoincrement: true, keyPath: 'ID' })
        } else {
            store = db.transaction.objectStore('electronic_store');
        }
        if (!store.indexNames.contains('name')) {
            console.log('Creating index name')
            store.createIndex('name', 'name');
        }
        if (!store.indexNames.contains('seller')) {
            console.log('Creating index seller')
            store.createIndex('seller', 'seller');
        }
        if (!store.indexNames.contains('price')) {
            console.log('Creating index price')
            store.createIndex('price', 'price');
        }
    }

    btnDiv.addEventListener('click', (e) => {
        console.log(e.target.id)
        if (e.target.id === 'btn-create') {
            
            addItems()
        }
    })


    function addItems() {
        x = db.getAll('ID')
        console.log(x)
    }

})()

