// Khởi tạo Firebase với cấu hình từ file firebase-config.js
firebase.initializeApp(firebaseConfig);

// Tạo đối tượng Firestore và Auth để thao tác với Firestore và xác thực người dùng
const firestore = firebase.firestore();
const auth = firebase.auth();

// Đăng nhập Google:
// Khi người dùng bấm nút đăng nhập, mở popup Google để xác thực.
// Nếu đăng nhập thành công, gọi showUserInfo để cập nhật giao diện.
// Nếu thất bại, hiển thị thông báo lỗi.
document.getElementById('login-google').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => showUserInfo(result.user))
        .catch(error => alert('Đăng nhập thất bại: ' + error.message));
});

// Đăng xuất:
// Khi người dùng bấm nút đăng xuất, thực hiện signOut và cập nhật lại giao diện.
document.getElementById('logout-google').addEventListener('click', () => {
    auth.signOut().then(() => showUserInfo(null));
});

// Hiển thị thông tin người dùng và bật/tắt chức năng nhập/ghi:
// Nếu đã đăng nhập, hiển thị tên, email, bật input và nút ghi dữ liệu.
// Nếu chưa đăng nhập, ẩn nút đăng xuất, tắt input và nút ghi dữ liệu.
function showUserInfo(user) {
    const infoDiv = document.getElementById('user-info');
    const input = document.getElementById('data-input');
    const saveBtn = document.getElementById('save-data');
    if (user) {
        infoDiv.innerHTML = `Xin chào, ${user.displayName} (${user.email})`;
        document.getElementById('login-google').style.display = 'none';
        document.getElementById('logout-google').style.display = 'inline-block';
        input.disabled = false;
        saveBtn.disabled = false;
        // Hiển thị dữ liệu của user khi đăng nhập
        loadUserData(user.uid);
    } else {
        infoDiv.innerHTML = 'Bạn chưa đăng nhập!';
        document.getElementById('login-google').style.display = 'inline-block';
        document.getElementById('logout-google').style.display = 'none';
        input.disabled = true;
        saveBtn.disabled = true;
        document.getElementById('firebase-data').innerHTML = '';
    }
}

// Theo dõi trạng thái đăng nhập:
// Khi trạng thái đăng nhập thay đổi (đăng nhập/đăng xuất), tự động cập nhật giao diện.
auth.onAuthStateChanged(user => showUserInfo(user));

// Ghi dữ liệu vào Firestore (chỉ khi đã đăng nhập):
// Khi người dùng bấm nút ghi dữ liệu, lấy giá trị từ input và thông tin người dùng.
// Nếu hợp lệ, ghi dữ liệu vào cấu trúc: user/<uid>/inputText/<autoId> { name, data }.
// Sau khi ghi, xóa nội dung input và tải lại dữ liệu.
document.getElementById('save-data').addEventListener('click', async () => {
    const value = document.getElementById('data-input').value;
    const user = auth.currentUser;
    if (!value || !user) return;

    // Ghi vào cấu trúc: user/<uid>/inputText/<autoId> { name, data }
    const userDocRef = firestore.collection('user').doc(user.uid);
    const inputTextColRef = userDocRef.collection('inputText');
    await inputTextColRef.add({
        name: user.displayName,
        data: value
    });

    document.getElementById('data-input').value = '';
    loadUserData(user.uid); // Reload dữ liệu sau khi ghi
});

// Đọc và hiển thị dữ liệu của user hiện tại:
// Lấy dữ liệu từ Firestore theo cấu trúc user/<uid>/inputText.
// Mỗi khi có dữ liệu mới, cập nhật danh sách hiển thị trên giao diện.
// Hiển thị giá trị và tên người đã ghi dữ liệu.
async function loadUserData(uid) {
    const ul = document.getElementById('firebase-data');
    ul.innerHTML = '';
    const inputTextColRef = firestore.collection('user').doc(uid).collection('inputText');
    const snapshot = await inputTextColRef.get();
    snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = `${data.data} (by ${data.name})`;
        ul.appendChild(li);
    });
}