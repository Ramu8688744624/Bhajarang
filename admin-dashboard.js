// ==== Jai Bhajarang Mobiles Admin Dashboard (Firebase Version) ====

// 1. Firebase Config & Init
const firebaseConfig = {
  apiKey: "AIzaSyBnvVzRwCzwGdPzInwC1J1b2MpVh_zQlew",
  authDomain: "bhajarang-offers.firebaseapp.com",
  projectId: "bhajarang-offers",
  storageBucket: "bhajarang-offers.firebasestorage.app",
  messagingSenderId: "585545255878",
  appId: "1:585545255878:web:bc728387d933b1fed540c7",
  measurementId: "G-29J69VBDVH"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 2. Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // 3. Auth Check
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'admin.html';
    } else {
      initializeDashboard();
    }
  });
});

function initializeDashboard() {
  console.log('Initializing dashboard...');
  
  // 4. DOM References
  const offersTableBody = document.getElementById('offers-table-body');
  const addOfferBtn = document.getElementById('add-offer-btn');
  const offerFormSection = document.getElementById('offer-form-section');
  const offerForm = document.getElementById('offer-form');
  const offerIdInput = document.getElementById('offer-id');
  const offerTitleInput = document.getElementById('offer-title');
  const offerDescriptionInput = document.getElementById('offer-description');
  const offerValidityInput = document.getElementById('offer-validity');
  const offerFormError = document.getElementById('offer-form-error');
  const saveBtnText = document.getElementById('save-btn-text');
  const closeFormBtn = document.getElementById('close-form-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const adminLoading = document.getElementById('admin-loading');
  const adminNoOffers = document.getElementById('admin-no-offers');
  const offersTableContainer = document.getElementById('offers-table-container');
  const offersCount = document.getElementById('offers-count');

  // 5. State
  let editingOfferId = null;
  let offersUnsubscribe = null;

  // 6. Event Listeners
  if (addOfferBtn) {
    console.log('Add offer button found, attaching listener');
    addOfferBtn.addEventListener('click', showAddOfferForm);
  } else {
    console.error('Add offer button not found!');
  }
  
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', hideOfferForm);
  }
  
  if (cancelFormBtn) {
    cancelFormBtn.addEventListener('click', hideOfferForm);
  }

  if (offerForm) {
    console.log('Offer form found, attaching submit listener');
    offerForm.addEventListener('submit', handleFormSubmit);
  } else {
    console.error('Offer form not found!');
  }

  // 7. Load offers
  loadOffers();

  // 8. Function Declarations
  function loadOffers() {
    console.log('Loading offers...');
    if (!offersTableBody || !adminLoading || !adminNoOffers || !offersTableContainer) {
      console.error('Required DOM elements not found for loading offers');
      return;
    }
    
    if (offersUnsubscribe) offersUnsubscribe();
    
    adminLoading.style.display = 'block';
    adminNoOffers.style.display = 'none';
    offersTableContainer.style.display = 'none';
    
    offersUnsubscribe = db.collection('offers').orderBy('validTill').onSnapshot(snapshot => {
      console.log('Offers snapshot received:', snapshot.size, 'offers');
      if (!offersTableBody) return;
      
      offersTableBody.innerHTML = '';
      const offers = [];
      
      snapshot.forEach(doc => {
        const offer = doc.data();
        offer.id = doc.id;
        offers.push(offer);
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="offer-title-cell">${escapeHtml(offer.title)}</td>
          <td class="offer-description-cell" title="${escapeHtml(offer.description)}">${escapeHtml(offer.description)}</td>
          <td class="offer-validity-cell">${offer.validTill ? escapeHtml(offer.validTill) : 'No expiry'}</td>
          <td>${offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('en-IN') : ''}</td>
          <td>
            <div class="offer-actions">
              <button class="action-btn edit" onclick="window.editOffer('${escapeHtml(offer.id)}')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="action-btn delete" onclick="window.deleteOffer('${escapeHtml(offer.id)}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </td>
        `;
        offersTableBody.appendChild(row);
      });
      
      if (offersCount) {
        offersCount.textContent = offers.length;
      }
      
      adminLoading.style.display = 'none';
      
      if (offers.length === 0) {
        if (adminNoOffers) adminNoOffers.style.display = 'block';
        if (offersTableContainer) offersTableContainer.style.display = 'none';
      } else {
        if (adminNoOffers) adminNoOffers.style.display = 'none';
        if (offersTableContainer) offersTableContainer.style.display = 'block';
      }
    }, error => {
      console.error('Error loading offers:', error);
      if (adminLoading) adminLoading.style.display = 'none';
    });
  }

  function showAddOfferForm() {
    console.log('Showing add offer form');
    editingOfferId = null;
    if (offerForm) offerForm.reset();
    if (offerIdInput) offerIdInput.value = '';
    if (saveBtnText) saveBtnText.textContent = 'Save Offer';
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.textContent = 'Add New Offer';
    
    if (offerFormSection) offerFormSection.style.display = 'flex';
    if (offerFormError) offerFormError.textContent = '';
    
    // Clear image inputs
    const imageFile = document.getElementById('offer-image-file');
    const imageUrl = document.getElementById('offer-image-url');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-image-btn');
    
    if (imageFile) imageFile.value = '';
    if (imageUrl) imageUrl.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
  }

  function hideOfferForm() {
    console.log('Hiding offer form');
    if (offerFormSection) offerFormSection.style.display = 'none';
    if (offerForm) offerForm.reset();
    editingOfferId = null;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    // Get form elements directly from document
    const formOfferIdInput = document.getElementById('offer-id');
    const formOfferTitleInput = document.getElementById('offer-title');
    const formOfferDescriptionInput = document.getElementById('offer-description');
    const formOfferValidityInput = document.getElementById('offer-validity');
    const formOfferFormError = document.getElementById('offer-form-error');
    const formOfferFormSection = document.getElementById('offer-form-section');
    const formOfferForm = document.getElementById('offer-form');
    
    if (!formOfferIdInput || !formOfferTitleInput || 
        !formOfferDescriptionInput || !formOfferValidityInput || 
        !formOfferFormError) {
      console.error('Required form elements not found');
      console.log('Missing elements:', {
        offerIdInput: !!formOfferIdInput,
        offerTitleInput: !!formOfferTitleInput,
        offerDescriptionInput: !!formOfferDescriptionInput,
        offerValidityInput: !!formOfferValidityInput,
        offerFormError: !!formOfferFormError
      });
      return;
    }
    
    formOfferFormError.textContent = '';
    const id = formOfferIdInput.value;
    const title = formOfferTitleInput.value.trim();
    const description = formOfferDescriptionInput.value.trim();
    const validTill = formOfferValidityInput.value;
    const imageFile = document.getElementById('offer-image-file')?.files[0];
    const existingImageUrl = document.getElementById('offer-image-url')?.value.trim();
    const createdAt = new Date().toISOString();
    
    console.log('Form data:', { title, description, validTill, hasImageFile: !!imageFile, existingImageUrl });
    
    if (!title || !description) {
      if (formOfferFormError) {
        formOfferFormError.textContent = 'Title and description are required.';
      }
      return;
    }

    try {
      let imageUrl = existingImageUrl;
      
      // If a new image file is selected, upload it
      if (imageFile) {
        console.log('Uploading image file:', imageFile.name);
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`offers/${Date.now()}_${imageFile.name}`);
        const uploadTask = fileRef.put(imageFile);
        
        // Show upload progress
        const progressBar = document.getElementById('upload-progress');
        if (progressBar) {
          progressBar.style.display = 'block';
          progressBar.value = 0;
          
          uploadTask.on('state_changed',
            (snapshot) => {
              // Progress function
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              progressBar.value = progress;
              console.log('Upload progress:', progress + '%');
            },
            (error) => {
              // Error function
              console.error('Upload error:', error);
              formOfferFormError.textContent = 'Failed to upload image. Please try again.';
              if (progressBar) progressBar.style.display = 'none';
              throw error;
            }
          );
          
          // Wait for upload to complete
          await uploadTask;
          imageUrl = await fileRef.getDownloadURL();
          console.log('Image uploaded successfully:', imageUrl);
          if (progressBar) progressBar.style.display = 'none';
        }
      }

      const offerData = { 
        title, 
        description, 
        validTill: validTill || null, 
        imageUrl: imageUrl || null, 
        createdAt,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Saving offer data:', offerData);
      
      if (id) {
        await db.collection('offers').doc(id).update(offerData);
        console.log('Offer updated successfully');
      } else {
        await db.collection('offers').add(offerData);
        console.log('Offer added successfully');
      }
      
      if (formOfferFormSection) formOfferFormSection.style.display = 'none';
      if (formOfferForm) formOfferForm.reset();
      editingOfferId = null;
    } catch (err) {
      console.error('Error saving offer:', err);
      if (formOfferFormError) {
        formOfferFormError.textContent = 'Failed to save offer. Please try again.';
      }
    }
  }

  // Helper function to prevent XSS
  function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Image upload helper functions
function showImagePreview(input) {
  console.log('Showing image preview');
  const preview = document.getElementById('image-preview');
  const file = input.files[0];
  
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      const removeBtn = document.getElementById('remove-image-btn');
      if (removeBtn) removeBtn.style.display = 'inline-block';
    }
    
    reader.readAsDataURL(file);
    const urlInput = document.getElementById('offer-image-url');
    if (urlInput) urlInput.value = ''; // Clear URL input if file is selected
  }
}

function removeImage() {
  console.log('Removing image');
  const preview = document.getElementById('image-preview');
  if (preview) {
    preview.src = '#';
    preview.style.display = 'none';
  }
  const fileInput = document.getElementById('offer-image-file');
  if (fileInput) fileInput.value = '';
  const removeBtn = document.getElementById('remove-image-btn');
  if (removeBtn) removeBtn.style.display = 'none';
}

function clearFileInput() {
  console.log('Clearing file input');
  const fileInput = document.getElementById('offer-image-file');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('image-preview');
  if (preview) preview.style.display = 'none';
  const removeBtn = document.getElementById('remove-image-btn');
  if (removeBtn) removeBtn.style.display = 'none';
}

// Make functions available globally
window.showImagePreview = showImagePreview;
window.removeImage = removeImage;
window.clearFileInput = clearFileInput;

// 9. Global functions for inline event handlers
window.editOffer = function(id) {
  console.log('Editing offer:', id);
  const db = firebase.firestore();
  const offerIdInput = document.getElementById('offer-id');
  const offerTitleInput = document.getElementById('offer-title');
  const offerDescriptionInput = document.getElementById('offer-description');
  const offerValidityInput = document.getElementById('offer-validity');
  const saveBtnText = document.getElementById('save-btn-text');
  const offerFormSection = document.getElementById('offer-form-section');
  const offerFormError = document.getElementById('offer-form-error');
  const formTitle = document.getElementById('form-title');

  if (!id || !db || !offerIdInput || !offerTitleInput || !offerDescriptionInput || 
      !offerValidityInput || !saveBtnText || 
      !offerFormSection || !offerFormError || !formTitle) {
    console.error('Required elements not found for editing offer');
    return;
  }

  db.collection('offers').doc(id).get().then(doc => {
    if (!doc.exists) {
      console.error('Offer not found');
      return;
    }

    const offer = doc.data();
    window.editingOfferId = id;
    
    offerIdInput.value = id;
    offerTitleInput.value = offer.title || '';
    offerDescriptionInput.value = offer.description || '';
    offerValidityInput.value = offer.validTill || '';
    
    // Handle image URL
    const imageUrlInput = document.getElementById('offer-image-url');
    if (imageUrlInput && offer.imageUrl) {
      imageUrlInput.value = offer.imageUrl;
    }
    
    saveBtnText.textContent = 'Update Offer';
    formTitle.textContent = 'Edit Offer';
    offerFormSection.style.display = 'flex';
    offerFormError.textContent = '';
    
    console.log('Offer loaded for editing:', offer);
  }).catch(error => {
    console.error('Error loading offer:', error);
  });
};

window.deleteOffer = function(id) {
  console.log('Deleting offer:', id);
  if (!id || !window.confirm('Are you sure you want to delete this offer?')) {
    return;
  }

  const db = firebase.firestore();
  db.collection('offers').doc(id).delete()
    .then(() => {
      console.log('Offer deleted successfully');
    })
    .catch(error => {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer. Please try again.');
    });
};

window.logout = function() {
  console.log('Logging out');
  const auth = firebase.auth();
  auth.signOut().catch(error => {
    console.error('Error signing out:', error);
  });
};
