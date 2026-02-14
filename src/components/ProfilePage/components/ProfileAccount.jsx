const ProfileAccount = ({ email }) => {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <section>
      <h2 className="text-lg font-bold mb-3">Account</h2>
      <div className="border rounded-xl p-5 text-sm">
        <p>Email: {email}</p>
        <button onClick={logout} className="text-red-500 mt-2">
          Logout
        </button>
      </div>
    </section>
  );
};

export default ProfileAccount;
