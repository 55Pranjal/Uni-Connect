// import api from "../../api/api";

// const TransferOwnershipModal = ({ isOpen, onClose, communityId, member }) => {
//   if (!isOpen || !member) return null;

//   const handleTransfer = async () => {
//     try {
//       await api.post(`/community/${communityId}/transfer/${member.userId._id}`);

//       alert("Ownership transferred");

//       window.location.reload();
//     } catch (err) {
//       alert(err.response?.data?.message || "Transfer failed");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
//       <div className="bg-white rounded-xl shadow-lg p-6 w-80">
//         <h2 className="text-lg font-bold mb-2">Transfer Ownership</h2>

//         <p className="text-sm text-slate-600 mb-6">
//           Transfer ownership to{" "}
//           <span className="font-semibold">{member.userId?.name}</span>?
//         </p>

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-slate-200 rounded-lg"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleTransfer}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           >
//             Transfer
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TransferOwnershipModal;
