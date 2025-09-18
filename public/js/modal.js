function showModal(title, content, footer=false) {
    const existingModal=document.getElementById("dynamic-modal");
    if (existingModal) {
        existingModal.remove();
    }

    const modal=document.createElement("div");
    modal.id="dynamic-modal";
    modal.className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen bg-black/80";
    modal.addEventListener("click", closeModal);

    const modalContent=document.createElement("div");
    modalContent.className="relative p-0 sm:py-0 w-full max-w-2xl max-h-full";
    modalContent.addEventListener("click", (event) => event.stopPropagation());

    const footerContent=footer? `
    <div class="flex items-center justify-end p-4 md:p-5  rounded-b ">
        <button onclick="closeModal()" class="w-24 flex items-center justify-center font-medium text-sm px-2 py-2 gap-1 rounded-lg text-dark-text bg-dark-background dark:text-light-text dark:bg-light-background">Close</button>
    </div>` :'';

    modalContent.innerHTML=`
        <div class="relative bg-white dark:bg-dark-secondary rounded-lg shadow-lg">
            <div class="flex items-start justify-between p-4 rounded-t">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${title}</h3>
            </div>
            <div class="p-4 space-y-4">
                ${content}
            </div>
             ${footerContent}
        </div>`;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function closeModal() {
    const modal=document.getElementById("dynamic-modal");
    if (modal) {
        modal.remove();
    }
}

function showModalPopup(message, isSuccess=true, reload=true) {
    const existingModal=document.getElementById("dynamic-modal-popup");
    if (existingModal) {
        existingModal.remove();
    }

    const modal=document.createElement("div");
    modal.id="dynamic-modal-popup";
    modal.className="fixed inset-0 flex items-center justify-center bg-black/80 z-50";

    modal.innerHTML=`
    <div class="bg-white dark:bg-dark-secondary rounded-lg shadow-lg p-6 w-96">
        <h3 class="text-lg font-semibold ${isSuccess? 'text-green-600':'text-red-600'}">
            ${isSuccess? translations.success:translations.error}
        </h3>
        <p class="mt-2 text-gray-700 dark:text-gray-300">${message}</p>
        <div class="mt-4 flex justify-end">
            <button class="close-modal w-24 flex items-center justify-center font-medium text-sm px-2 py-2 gap-1 rounded-lg text-dark-text bg-dark-background dark:text-light-text dark:bg-light-background">${translations.ok}</button>
        </div>
    </div>`;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").addEventListener("click", () => {
        modal.remove();
        if (isSuccess) {
            if (reload) {
                location.reload();
            }
        }
    });

    if (isSuccess) {
        setTimeout(() => {
            modal.remove();
            if (reload) {
                location.reload();
            }
        }, 3000);
    }
}

function closeModalConfirm() {
    const modal=document.getElementById("confirmation-modal");
    if (modal) {
        modal.remove();
    }
}

function showConfirmationModal(title, content,) {
    const existingModal=document.getElementById("confirmation-modal");
    if (existingModal) {
        existingModal.remove();
    }

    const modal=document.createElement("div");
    modal.id="confirmation-modal";
    modal.className="fixed inset-0 flex items-center justify-center bg-black/80 z-50";
    modal.addEventListener("click", closeModalConfirm);

    const modalContent=document.createElement("div");
    modalContent.className="relative w-full max-w-2xl max-h-full bg-light-secondary rounded-lg shadow-sm dark:bg-dark-secondary";
    modalContent.addEventListener("click", (event) => event.stopPropagation());

    modalContent.innerHTML=`
    <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${title}</h3>
    </div>
    <div class="p-4 space-y-4">
        ${content}
    </div>`;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);


}