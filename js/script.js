// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});

// Sample data (in a real application, this would come from a backend)
const defaultBooks = [];

// Load or initialize books and requests from localStorage
let books = JSON.parse(localStorage.getItem('books')) || defaultBooks;
let requests = JSON.parse(localStorage.getItem('requests')) || [];
let currentUser = null;

function saveBooks() {
    localStorage.setItem('books', JSON.stringify(books));
}

function saveRequests() {
    localStorage.setItem('requests', JSON.stringify(requests));
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Create error message div if it doesn't exist
        if (!document.getElementById('loginError')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'loginError';
            errorDiv.style.display = 'none';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.backgroundColor = '#f8d7da';
            errorDiv.style.border = '1px solid #f5c6cb';
            errorDiv.style.borderRadius = '4px';
            errorDiv.style.padding = '10px';
            errorDiv.style.marginBottom = '15px';
            errorDiv.style.textAlign = 'center';
            loginForm.insertBefore(errorDiv, loginForm.firstChild);
        }

        // Password visibility toggle
        const passwordInput = document.getElementById('password');
        const togglePassword = document.querySelector('.password-toggle');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle eye icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const userType = document.getElementById('userType').value;
            const errorDiv = document.getElementById('loginError');

            // Validate empty fields
            if (!username || !password) {
                errorDiv.textContent = 'Please fill in all fields!';
                errorDiv.style.display = 'block';
                return;
            }

            // Check credentials based on user type
            let isValid = false;
            if (userType === 'librarian') {
                if (username !== 'admin') {
                    errorDiv.textContent = 'Invalid librarian username!';
                    errorDiv.style.display = 'block';
                    return;
                }
                if (password !== 'admin123') {
                    errorDiv.textContent = 'Invalid librarian password!';
                    errorDiv.style.display = 'block';
                    return;
                }
                isValid = true;
            } else if (userType === 'student') {
                if (username !== 'user') {
                    errorDiv.textContent = 'Invalid student username!';
                    errorDiv.style.display = 'block';
                    return;
                }
                if (password !== 'user123') {
                    errorDiv.textContent = 'Invalid student password!';
                    errorDiv.style.display = 'block';
                    return;
                }
                isValid = true;
            }

            if (isValid) {
                errorDiv.style.display = 'none';
                currentUser = { username, type: userType };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                window.location.href = 'dashboard.html';
            }
        });

        // Clear error message when user starts typing
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const errorDiv = document.getElementById('loginError');
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            });
        });
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    } else if (!window.location.href.includes('login.html') && !window.location.href.includes('index.html')) {
        window.location.href = 'login.html';
    }

    // Initialize dashboard
    if (document.getElementById('librarianView') || document.getElementById('studentView')) {
        initializeDashboard();
    }
    // Initialize books page
    if (document.getElementById('addBookForm')) {
        initializeBooksPage();
    }
    // Initialize borrow page
    if (document.getElementById('availableBooksTable')) {
        initializeBorrowPage();
    }
});

// Signup functionality
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const userType = document.getElementById('userType').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;

            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Validate terms acceptance
            if (!terms) {
                alert('Please accept the Terms & Conditions');
                return;
            }

            // Create user object
            const newUser = {
                fullName,
                email,
                type: userType,
                password, // In a real application, this should be hashed
                createdAt: new Date().toISOString()
            };

            // Store user data (in a real application, this would be sent to a server)
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Set current user and redirect to dashboard
            currentUser = { username: email, type: userType };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Show success message
            alert('Account created successfully!');
            window.location.href = 'dashboard.html';
        });

        // Password visibility toggle
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
                
                this.classList.toggle('show-password');
            });
        });
    }
});

// Dashboard functionality
function initializeDashboard() {
    const userTypeElement = document.getElementById('userType');
    const librarianView = document.getElementById('librarianView');
    const studentView = document.getElementById('studentView');
    if (userTypeElement && currentUser) {
        userTypeElement.textContent = `Logged in as:  ${currentUser.username} (${currentUser.type})`;
    }
    if (librarianView && studentView && currentUser) {
        if (currentUser.type === 'librarian') {
            librarianView.classList.add('active');
            studentView.classList.remove('active');
        } else {
            studentView.classList.add('active');
            librarianView.classList.remove('active');
        }
    }
}

// Books page functionality
function initializeBooksPage() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const newBook = {
                id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
                title: title,
                author: author,
                issued: false
            };
            books.push(newBook);
            saveBooks();
            updateBooksTable();
            addBookForm.reset();
        });
    }
    updateBooksTable();
    // Attach search event for books page
    const searchBtn = document.getElementById('searchBooksBtn');
    if (searchBtn) {
        searchBtn.onclick = searchBooksBooksPage;
    }
}

function updateBooksTable() {
    const tableBody = document.getElementById('booksTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.issued ? 'Yes' : 'No'}</td>
                <td>
                    <button onclick="updateBook(${book.id})">Update</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function searchBooksBooksPage() {
    const searchInput = document.getElementById('searchInputBooks');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
        const tableBody = document.getElementById('booksTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';
            filteredBooks.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.issued ? 'Yes' : 'No'}</td>
                    <td>
                        <button onclick="updateBook(${book.id})">Update</button>
                        <button onclick="deleteBook(${book.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
}

// Borrow page functionality
function initializeBorrowPage() {
    // Show/hide admin-only sections
    const adminSections = document.querySelectorAll('.admin-only');
    adminSections.forEach(section => {
        if (currentUser && currentUser.type === 'librarian') {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Show/hide student-only sections
    const studentSections = document.querySelectorAll('.student-only');
    studentSections.forEach(section => {
        if (currentUser && currentUser.type === 'student') {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    updateAvailableBooksTable();
    updateRequestsTables();
    // Attach search event for borrow page
    const searchBtn = document.getElementById('searchBorrowBtn');
    if (searchBtn) {
        searchBtn.onclick = searchBooksBorrowPage;
    }
}

function updateAvailableBooksTable() {
    const tableBody = document.getElementById('availableBooksTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        books.forEach(book => {
            if (!book.issued) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>
                        ${currentUser.type === 'student' 
                            ? `<button onclick="requestBook(${book.id})">Request</button>`
                            : `<button onclick="issueBook(${book.id})">Issue</button>`
                        }
                    </td>
                `;
                tableBody.appendChild(row);
            }
        });
    }
}

function searchBooksBorrowPage() {
    const searchInput = document.getElementById('searchInputBorrow');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => 
            !book.issued && (book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm))
        );
        const tableBody = document.getElementById('availableBooksTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';
            filteredBooks.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>
                        ${currentUser.type === 'student' 
                            ? `<button onclick=\"requestBook(${book.id})\">Request</button>`
                            : `<button onclick=\"issueBook(${book.id})\">Issue</button>`
                        }
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
}

function updateRequestsTables() {
    // Update pending requests table (librarian view)
    const pendingRequestsTableBody = document.getElementById('pendingRequestsTableBody');
    if (pendingRequestsTableBody) {
        pendingRequestsTableBody.innerHTML = '';
        requests.forEach(request => {
            if (request.status === 'pending') {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.bookTitle}</td>
                    <td>${request.requestedBy}</td>
                    <td>${request.date}</td>
                    <td>
                        <button onclick="approveRequest(${request.id})">Approve</button>
                        <button onclick="rejectRequest(${request.id})">Reject</button>
                    </td>
                `;
                pendingRequestsTableBody.appendChild(row);
            }
        });
    }
    // Update my requests table (student view)
    const myRequestsTableBody = document.getElementById('myRequestsTableBody');
    if (myRequestsTableBody) {
        myRequestsTableBody.innerHTML = '';
        requests.forEach(request => {
            if (request.requestedBy === currentUser.username) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.bookTitle}</td>
                    <td>${request.status}</td>
                    <td>${request.date}</td>
                `;
                myRequestsTableBody.appendChild(row);
            }
        });
    }
}

function requestBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        const request = {
            id: requests.length ? Math.max(...requests.map(r => r.id)) + 1 : 1,
            bookId: bookId,
            bookTitle: book.title,
            requestedBy: currentUser.username,
            date: new Date().toLocaleDateString(),
            status: 'pending'
        };
        requests.push(request);
        saveRequests();
        updateRequestsTables();
    }
}

function issueBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.issued = true;
        saveBooks();
        updateAvailableBooksTable();
    }
}

function approveRequest(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (request) {
        request.status = 'approved';
        const book = books.find(b => b.id === request.bookId);
        if (book) {
            book.issued = true;
            saveBooks();
        }
        saveRequests();
        updateRequestsTables();
        updateAvailableBooksTable();
    }
}

function rejectRequest(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (request) {
        request.status = 'rejected';
        saveRequests();
        updateRequestsTables();
    }
}

// Utility functions
function updateBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        const newTitle = prompt('Enter new title:', book.title);
        const newAuthor = prompt('Enter new author:', book.author);
        if (newTitle && newAuthor) {
            book.title = newTitle;
            book.author = newAuthor;
            saveBooks();
            updateBooksTable();
        }
    }
}

function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(b => b.id !== bookId);
        requests = requests.filter(r => r.bookId !== bookId); // Remove related requests
        saveBooks();
        saveRequests();
        updateBooksTable();
        updateAvailableBooksTable && updateAvailableBooksTable();
        updateRequestsTables && updateRequestsTables();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}


function generateReport(format) {
    if (!currentUser || currentUser.type !== 'librarian') {
        alert('Only librarians can generate reports.');
        return;
    }

    const reportData = {
        books: books,
        requests: requests,
        generatedBy: currentUser.username,
        date: new Date().toLocaleString(),
        institution: "Central Library System",
        reportId: generateReportId()
    };

    const fileName = `library_report_${new Date().toISOString().split('T')[0]}`;
    
    try {
        switch (format) {
            case 'pdf':
                generatePDFReport(reportData, fileName);
                break;
            case 'excel':
                generateExcelReport(reportData, fileName);
                break;
            case 'csv':
                generateCSVReport(reportData, fileName);
                break;
            default:
                throw new Error('Unsupported format');
        }
    } catch (error) {
        console.error('Report generation failed:', error);
        alert('Failed to generate report. Please try again.');
    }
}

function generatePDFReport(data, fileName) {
    // Initialize jsPDF correctly
    const doc = new window.jspdf.jsPDF();

    // Helper functions
    const addPageNumbers = () => {
        const pages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Page ${i} of ${pages}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
    };

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text(data.institution, 20, 20);
    
    // Report metadata
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Report ID: ${data.reportId}`, 20, 30);
    doc.text(`Generated by: ${data.generatedBy}`, 20, 35);
    doc.text(`Date: ${data.date}`, 20, 40);

    // Summary Statistics in a styled box
    const stats = [
        ['Total Books: \t', data.books.length],
        ['Issued Books: \t', data.books.filter(book => book.issued).length],
        ['Available Books: \t', data.books.filter(book => !book.issued).length],
        ['Total Requests: \t', data.requests.length],
        ['Pending Requests: \t', data.requests.filter(req => req.status === 'pending').length]
    ];

    doc.setDrawColor(0, 51, 102);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 50, 170, 40, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 20, 47);

    // Two-column layout for statistics
    let startY = 60;
    
    if (data.books.length === 0) {
        doc.setFont(undefined, 'normal');
        doc.setTextColor(255, 0, 0);
        doc.text('No books have been added.', 30, startY);
        startY += 10; // Adjust starting Y for next stats if any
    } else {
        stats.forEach((stat, index) => {
            const x = index < 3 ? 30 : 110;
            const y = index < 3 ? startY + (index * 10) : startY + ((index - 3) * 10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0);
            doc.text(stat[0], x, y);
            doc.setFont(undefined, 'normal');
            doc.text(stat[1].toString(), x + 40, y);
        });
        startY += stats.length < 3 ? stats.length * 10 : Math.ceil(stats.length / 2) * 10; // Adjust startY based on max height of columns
    }

    // Books Inventory Table
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('Books Inventory', 20, 20);

    doc.autoTable({
        startY: 30,
        head: [['ID', 'Title', 'Author', 'Status', 'Last Updated']],
        body: data.books.map(book => [
            book.id,
            book.title,
            book.author,
            book.issued ? 'Issued' : 'Available',
            new Date().toLocaleDateString()
        ]),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
            fillColor: [0, 51, 102],
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Requests Table
    
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('Book Requests', 20, 20);

    doc.autoTable({
        startY: 30,
        head: [['ID', 'Book Title', 'Requested By', 'Date', 'Status', 'Book ID']],
        body: data.requests.map(request => [
            request.id,
            request.bookTitle,
            request.requestedBy,
            request.date,
            request.status,
            request.bookId
        ]),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
            fillColor: [0, 51, 102],
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Finalize document
    addPageNumbers();
    doc.save(`${fileName}.pdf`);
}

function generateExcelReport(data, fileName) {
    const wb = XLSX.utils.book_new();
    
    // Add metadata sheet
    const metadataSheet = [
        ['Library Management System Report'],
        ['Institution:', data.institution],
        ['Report ID:', data.reportId],
        ['Generated by:', data.generatedBy],
        ['Date:', data.date],
        [],
        ['Summary Statistics'],
        ['Total Books:', data.books.length],
        ['Issued Books:', data.books.filter(book => book.issued).length],
        ['Available Books:', data.books.filter(book => !book.issued).length],
        ['Total Requests:', data.requests.length],
        ['Pending Requests:', data.requests.filter(req => req.status === 'pending').length]
    ];
    
    if (data.books.length === 0) {
        metadataSheet.push(['No books have been added.']);
    }

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metadataSheet), 'Summary');
    
    // Add books sheet with formatting
    const booksSheet = XLSX.utils.json_to_sheet(data.books.map(book => ({
        'ID': book.id,
        'Title': book.title,
        'Author': book.author,
        'Status': book.issued ? 'Issued' : 'Available',
        'Last Updated': new Date().toLocaleDateString()
    })));
    
    XLSX.utils.book_append_sheet(wb, booksSheet, 'Books');
    
    // Add requests sheet with formatting
    const requestsSheet = XLSX.utils.json_to_sheet(data.requests.map(request => ({
        'ID': request.id,
        'Book ID': request.bookId,
        'Book Title': request.bookTitle,
        'Requested By': request.requestedBy,
        'Date': request.date,
        'Status': request.status
    })));
    
    XLSX.utils.book_append_sheet(wb, requestsSheet, 'Requests');
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}

function generateCSVReport(data, fileName) {
    const generateCSVContent = (headers, rows) => {
        const headerRow = headers.join(',');
        const dataRows = rows.map(row => headers.map(header => row[header]).join(','));
        return [headerRow, ...dataRows].join('\n');
    };

    // Generate three separate CSV files
    const files = [
        {
            name: `${fileName}_summary.csv`,
            content: [
                'Library Management System Report',
                `Institution,${data.institution}`,
                `Report ID,${data.reportId}`,
                `Generated by,${data.generatedBy}`,
                `Date,${data.date}`,
                '',
                'Summary Statistics',
                `Total Books,${data.books.length}`,
                `Issued Books,${data.books.filter(book => book.issued).length}`,
                `Available Books,${data.books.filter(book => !book.issued).length}`,
                `Total Requests,${data.requests.length}`,
                `Pending Requests,${data.requests.filter(req => req.status === 'pending').length}`
            ].join('\n')
        },
        {
            name: `${fileName}_books.csv`,
            content: data.books.length === 0 ? 'No books have been added.' : generateCSVContent(
                ['ID', 'Title', 'Author', 'Status', 'Last Updated'],
                data.books.map(book => ({
                    'ID': book.id,
                    'Title': book.title,
                    'Author': book.author,
                    'Status': book.issued ? 'Issued' : 'Available',
                    'Last Updated': new Date().toLocaleDateString()
                }))
            )
        },
        {
            name: `${fileName}_requests.csv`,
            content: generateCSVContent(
                ['ID', 'Book ID', 'Book Title', 'Requested By', 'Date', 'Status'],
                data.requests
            )
        }
    ];

    // Create zip file containing all CSV files
    const zip = new JSZip();
    files.forEach(file => zip.file(file.name, file.content));
    
    zip.generateAsync({ type: 'blob' })
        .then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${fileName}_reports.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
}

function generateReportId() {
    return 'RPT-' + Date.now().toString(36).toUpperCase();
}