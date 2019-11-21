
(function app() {
    const btnDiv = document.querySelector('div.d-flex:nth-of-type(3)');
    const name = document.querySelector('#proname');
    const price = document.querySelector('#price');
    const seller = document.querySelector('#seller');
    const userid = document.querySelector('#userid');
    const showBtn = document.querySelector('#btn-get');
    const tbody = document.querySelector('.table tBody')

    let db;
    let dbReq;
    let store;
    let initUserid
    let show = true

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    dbReq = indexedDB.open('electronic-db', 1);

    dbReq.onsuccess = function (event) {
        db = event.target.result;
        console.log('Request successful');
        store = db.transaction('electronic_store').objectStore('electronic_store');
        getAllItems(store);
        updateDisplayedId(store);

    }

    dbReq.onerror = function (event) {
        console.error('error opening datatbase ' + event.target.errorCode)
        return;
    }

    dbReq.onupgradeneeded = function (event) {
        console.log(event.target.result)
        db = event.target.result


        console.log('Creating the product object store');
        if (!db.objectStoreNames.contains('electronic_store')) {
            store = db.createObjectStore('electronic_store', { autoincrement: true, keyPath: 'ID' })
        } else {
            store = db.transaction('electronic_store').objectStore('electronic_store')
            console.log(store)
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

    if (store) {
        store.transaction.oncomplete = function () {
            console.log('Indexes created')
        }

        store.transaction.onerror = function (error) {
            console.log('An error occured while upgrading database')
            return;
        }
    }


    btnDiv.addEventListener('click', (e) => {
        store = db.transaction('electronic_store', 'readwrite').objectStore('electronic_store')

        if (e.target.id === 'btn-create') {
            let object = { name: name.value, seller: seller.value, price: price.value };

            if (userid.value) {
                object.ID = Number(userid.value);
                addItems(store, object);
            } else {
                console.log('There was an error generating an ID for this item')
            }

        } else if (e.target.id === 'btn-get') {
            if (!show) {
                getAllItems(store);
                show = !show;
            } else {
                document.querySelector('.table tBody').innerHTML = '';
                show = !show;
            }
            showBtn.textContent = show ? 'Hide items' : 'Show items'
        } else if (e.target.id === 'btn-update') {
            let id = Number(userid.value);
            let data = { ID: id, name: name.value, seller: seller.value, price: price.value };
            update(store, id, data)

        } else if (e.target.id === 'btn-delete') {
            deleteAllItems(store)
        }
    });

    tbody.addEventListener('click', (e) => {
        store = db.transaction('electronic_store', 'readwrite').objectStore('electronic_store')
        if (e.target.classList.contains('btnedit')) {
            let id = Number(e.target['id']);
            initUserid = userid.value;
            getItem(id, store)
        } else if (e.target.classList.contains('btndelete')) {
            console.log()
            let id = Number(e.target.dataset.id);
            deleteItem(store, id);
        }
    });



    function addItems(store, object) {
        let flag = isEmpty(object);
        if (flag) {
            let tx = store.add(object);
            tx.onsuccess = function txSuccess() {
                name.value = price.value = seller.value = '';
                if (show === true) {
                    displayItems([object])
                }
                updateDisplayedId(store);
                console.log('Transaction was successfull')
            }
            tx.onerror = function txError(e) {
                console.log('Error' + e.target.errorCode)
            }

        } else {
            console.log('Provide Data')
        }
        return;

    }

    function getAllItems(store) {
        try {
            reqCount = store.count();
            reqCount.onsuccess = function () {
                if (reqCount.result > 0) {
                    let reqItems = store.getAll();
                    reqItems.onsuccess = function () {
                        displayItems(reqItems.result)

                        console.log(reqItems.result);
                        console.log('Transaction successfull')
                    }
                } else {
                    updateDisplayedId(store)
                    document.querySelector('#no-item').classList.remove('no-item');
                    console.log('No item in store');
                }

            }
        } catch (error) {
            console.log(error);
        }


    }

    function getItem(key, store) {

        try {
            let object;
            let reqCursor = store.openCursor(key);
            reqCursor.onsuccess = function (event) {
                let cursor = event.target.result
                if (cursor) {
                    object = cursor.value;
                    let properties = Object.keys(object);
                    properties.forEach((prop) => {
                        let input = document.querySelector(`[data-${prop}-value]`);
                        if (input !== null) input.value = object[prop];
                    })
                    console.log('Transaction successfull')

                } else {
                    console.log('Item not found in store');
                }
                return object;
            }
        } catch (error) {
            console.log(error);
        }
    }

    function update(store, key, data) {
        try {
            store.openCursor(key).onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    let flag = isEmpty(data);
                    if (flag) {
                        const request = cursor.update(data);
                        request.onsuccess = function () {
                            name.value = price.value = seller.value = '';
                            if (show === true) {
                                let tBody = document.querySelector('.table tBody');
                                tBody.innerHTML = '';
                                getAllItems(store)
                            }
                            userid.value = initUserid;
                            console.log('Transaction successful');
                        };

                    } else {
                        console.log('Provide Data')
                    }

                }
            };
        } catch (error) {
            console.log(error)
            return;
        }

    }

    function deleteItem(store, key) {
        if (window.confirm('Item will be permannently deleted from database')) {
            store.openCursor(key).onsuccess = function (event) {
                cursor = event.target.result;
                if (cursor) {
                    const request = cursor.delete();
                    request.onsuccess = function () {
                        if (show === true) {
                            let tBody = document.querySelector('.table tBody');
                            tBody.innerHTML = '';
                            getAllItems(store)
                        }
                        console.log('Item deleted successfully');

                    }

                    request.onerror = function (error) {
                        console.log(error)
                    }
                } else {
                    console.log('Item not found')
                }
            }
        }

    }

    function deleteAllItems(store) {
        if (window.confirm('All items will be permannently deleted from database')) {
            store.openCursor().onsuccess = function (event) {
                cursor = event.target.result;
                if (cursor) {
                    const request = cursor.delete();
                    cursor.continue()
                    request.onsuccess = function () {

                    };

                } else {
                    if (show === true) {
                        let tBody = document.querySelector('.table tBody');
                        tBody.innerHTML = '';
                        getAllItems(store)
                    }
                    console.log('Done!');
                }
            };
        }


    }


    function isEmpty(object) {
        let flag = false;
        if (object.seller && object.price && object.name) {
            flag = true;
        } else {
            flag = false;

        }

        return flag;
    }

    function displayItems(items) {
        let tBody = document.querySelector('.table tBody');
        if (items && items.length > 0) {
            document.querySelector('#no-item').classList.add('no-item');
            items.forEach(item => {
                let tr = document.createElement('tr')
                let amount = Number(item.price);
                item.price = amount.toLocaleString(`en-NG`, {
                    style: 'currency',
                    currency: 'NGN'
                });
                let row = `
                    <th scope="row">${item.ID}</th>
                    <td>${item.name}</td>
                    <td>${item.seller}</td>
                    <td>${item.price}</td>
                    <td> <i class=" fa fa-edit btnedit edit" id =${item.ID}></i></td>
                    <td><i class=" fa fa-trash btndelete" data-id =${item.ID}></i></td>
                `
                tr.innerHTML = row;
                tBody.appendChild(tr);
            })
        }
        return;
    }

    function updateDisplayedId(store) {
        reqKeys = store.getAllKeys();

        reqKeys.onsuccess = () => {
            if (reqKeys.readyState === 'done') {
                if (reqKeys.result && reqKeys.result.length > 0) {
                    userid.value = reqKeys.result.pop() + 1;
                }
                else {
                    userid.value = 1;
                }
            }
        }
    }

    function txSuccess() {
        console.log('Transaction was successfull')
    }


    function txError(e) {
        console.log('Error' + e.target.errorCode)
    }
})()

