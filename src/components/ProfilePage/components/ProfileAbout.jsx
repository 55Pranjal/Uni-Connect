const ProfileAbout = ({ user, onEdit }) => (
  <section>
    <div className="flex justify-between mb-3">
      <h2 className="text-lg font-bold">About</h2>
      <button onClick={onEdit} className="text-indigo-600 text-sm">
        Edit
      </button>
    </div>

    <div className="bg-white border rounded-xl p-5">
      <p>{user.bio || "No bio added yet."}</p>

      <div className="flex gap-4 text-sm mt-3">
        {user.github && <a href={user.github}>GitHub</a>}
        {user.linkedin && <a href={user.linkedin}>LinkedIn</a>}
      </div>
    </div>
  </section>
);

export default ProfileAbout;
