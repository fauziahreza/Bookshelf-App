const STORAGE_KEY = "BOOKSHELF_APP";
let books = [];

const BOOK_ITEMID = "itemId"; 
const COMPLETED_LIST_BOOK_ID = "completed"; 
const UNCOMPLETED_LIST_BOOK_ID = "uncompleted"; 

// periksa browser support
function isStorageExist() {
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        return true;
    } catch (e) {
        return false;
    }
}

// bikin objek buku 
function generate_book (title, author, year, isComplete) {
    return {
        id: +new Date(),
        title,
        author,
        year: Number(year),
        isComplete,
    };
}

// cari buku
function findBook (bookId) {
    for(book of books){
        if(book.id === bookId)
            return book;
    }
    return null;
}

// cari buku berdasar id
function findToIndex (bookId) {
    let index = 0
    for(book of books) {
        if(book.id === bookId)
            return index;
    
        index++;
    }
    
    return -1;
}

// refresh data
function refreshDataFromBooks() {
    const listUncompleted = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
    let listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);

    for(book of books){
        const newBook = createBook(book.title, book.author, book.year, book.isCompleted);
        newBook[BOOK_ITEMID] = book.id;

        if(book.isCompleted){
            listCompleted.append(newBook);
        }else{
            listUncompleted.append(newBook);
        }
    }
}

// membuat card buku

function createBook(bookTitle, bookAuthor, bookYear, isCompleted) {
    // membuat elemen judul buku (h3)
    const title = document.createElement("h3");
    title.innerText = bookTitle;

    // membuat elemen penulis buku (p)
    const author = document.createElement("p");
    author.innerHTML = `Penulis: <span>${bookAuthor}</span>`;

    // membuat elemen tahun buku (p)
    const year = document.createElement("p");
    year.innerHTML = `Tahun: <span>${bookYear}</span>`;

    // membuat elemen div untuk deskripsi buku
    const bookDesc = document.createElement("div");
    bookDesc.classList.add("book-desc");
    bookDesc.append(title, author, year);

    // membuat elemen div untuk tombol-tombol
    const buttons = document.createElement("div");
    buttons.classList.add("button");

    // menambahkan tombol berdasarkan status buku (selesai/belum selesai dibaca)
    if (isCompleted) {
        buttons.classList.add("completed");
        buttons.append(
            createUncompletedButton(),
            createTrashButton()
        );
    } else {
        buttons.classList.add("uncompleted");
        buttons.append(
            createCompletedButton(),
            createTrashButton()
        );
    }

    // membuat elemen div utama untuk buku
    const container = document.createElement("div");
    container.classList.add("book");
    container.append(bookDesc, buttons);

    return container;
}

function isCompleteBookHandler(itemElement) {
    const bookData = books;
    if (bookData.length === 0) {
      return;
    }
  
    const title = itemElement.querySelector(".book-desc h3").innerText;
    const titleNameAttribut = itemElement.getAttribute("itemId");
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].title === title && bookData[index].id == titleNameAttribut) {
        bookData[index].isComplete = !bookData[index].isComplete;
        break;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookData));
}

// button
function createButton(buttonTypeClass, eventListener) {
    // membuat elemen button
    const button = document.createElement("button");
    button.classList.add(buttonTypeClass);

    // Menambahkan atribut title berdasarkan kelas tombol
    if (button.classList.contains("completed-button")) {
        button.setAttribute("title", "Selesai Dibaca");
        button.innerText = "Selesai Dibaca";
    } else if (button.classList.contains("uncompleted-button")) {
        button.setAttribute("title", "Belum Selesai");
        button.innerText = "Belum Selesai";
    } else if (button.classList.contains("trash-button")) {
        button.setAttribute("title", "Hapus Buku");
        const iconTrash = document.createElement("i");
        iconTrash.className = 'ti ti-trash'
        button.appendChild(iconTrash);
    }

    // menambahkan event listener untuk tombol
    button.addEventListener("click", function (event) {
        eventListener(event);
    });

    return button;
}

function addBookToCompleted(bookElement){
    const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);
    const bookTitle = bookElement.querySelector(".book-desc h3").innerText;
    const bookAuthor = bookElement.querySelector(".book-desc p:nth-child(2) span").innerText;
    const bookYear = bookElement.querySelector(".book-desc p:nth-child(3) span").innerText;

    const newBook = createBook(bookTitle, bookAuthor, bookYear, true);
    const book = findBook(bookElement[BOOK_ITEMID]);
    book.isCompleted = true;
    newBook[BOOK_ITEMID] = book.id;

    listCompleted.append(newBook);
    bookElement.remove();

    updateDataToStorage();
}

function createCompletedButton(){
    return createButton("completed-button", function(){
        addBookToCompleted(document.querySelector("#uncompleted .book"));
    });
}

function undoBookFromCompleted(bookElement){
    const listUncompleted = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
    const bookTitle = bookElement.querySelector(".book-desc h3").innerText;
    const bookAuthor = bookElement.querySelector(".book-desc p:nth-child(2) span").innerText;
    const bookYear = bookElement.querySelector(".book-desc p:nth-child(3) span").innerText;

    const newBook = createBook(bookTitle, bookAuthor, bookYear, false);

    const book = findBook(bookElement[BOOK_ITEMID]);
    book.isCompleted = false;
    newBook[BOOK_ITEMID] = book.id;

    listUncompleted.append(newBook);
    bookElement.remove();

    updateDataToStorage();
}

function createUncompletedButton(){
    return createButton("uncompleted-button", function(){
        undoBookFromCompleted(document.querySelector("#completed .book"));
    });
}

function removeBookFromCompleted(bookElement){
    const target = bookElement;
    const book = target.parentElement;
    const bookPosition = findToIndex(book[BOOK_ITEMID]);

    Swal.fire({
        title: "Kamu yakin mau hapus buku ini   ?",
        text: "",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Iya",
        denyButtonText: "Tidak",
        showCancelButton: false
    }).then((result) => {
        if(result.value){
            if(target.classList.contains("uncompleted")){
                books.splice(bookPosition, 1)
                book.remove();
                updateDataToStorage();
            }else if(target.classList.contains("completed")){
                books.splice(bookPosition, 1)
                book.remove();
                updateDataToStorage();
            }
            Swal.fire(
                "Deleted!",
                "Buku Berhasil di Hapus",
                "success"
            )
        }
    })
    updateDataToStorage();
}

// tambah buku
function addBook(){
    const uncompletedBookList = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
    const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);

    const bookTitle = document.getElementById("title").value;
    const bookAuthor = document.getElementById("author").value;
    const bookYear = document.getElementById("year").value;

    const isCompleteCheckbox = document.getElementById("inputBookIsComplete");
    const isComplete = isCompleteCheckbox.checked;

    const book = createBook(bookTitle, bookAuthor, bookYear, isComplete);
    const bookObject = generate_book(bookTitle, bookAuthor, bookYear, isComplete);

    book[BOOK_ITEMID] = bookObject.id;
    books.push(bookObject);

    if (isComplete) {
        listCompleted.append(book);
    } else {
        uncompletedBookList.append(book);
    }

    updateDataToStorage();
}


function createTrashButton(){
    return createButton("trash-button", function(event){
        removeBookFromCompleted(event.target.parentElement);
    });
}

// simpen data
function saveData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

// load data dari storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    let data = JSON.parse(serializedData);
    
    if(data !== null)
        books = data;
    
    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if(isStorageExist())
        saveData();
}

// search book
const searchBook = document.getElementById("searchbook");

searchBook.addEventListener("keyup", function (e) {
    const searchQuery = e.target.value.toLowerCase();
    const books = document.querySelectorAll(".book");

    books.forEach((book) => {
        const bookDesc = book.querySelector(".book-desc h3");
        const bookTitle = bookDesc.firstChild.textContent.toLowerCase();

        let match = true;
        for (let i = 0; i < searchQuery.length; i++) {
            if (bookTitle.indexOf(searchQuery[i]) === -1) {
                match = false;
                break;
            }
        }

        if (match) {
            book.style.display = "flex";
        } else {
            book.style.display = "none";
        }
    });
});

// event listener content load
document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById("form");
    function clearForm(){
        document.getElementById("title").value = "";
        document.getElementById("author").value = "";
        document.getElementById("year").value = "";
    }
    submitForm.addEventListener("submit", function(event) {
        event.preventDefault();
        addBook();
        clearForm();
    });
    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener("ondatasaved", () => {
    console.log("Data berhasil disimpan.");
});

document.addEventListener("ondataloaded", () => {
    refreshDataFromBooks();
});