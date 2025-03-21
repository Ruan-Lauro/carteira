
document.addEventListener('DOMContentLoaded', function() {
    let selectedColor = '#1e7fd6';
    let selectedIcon = 'fa-cat';
  
    const colorPicker = document.getElementById('colorPicker');
    const colorHex = document.getElementById('colorHex');
    const iconSelector = document.getElementById('iconSelector');
    const iconDropdown = document.getElementById('iconDropdown');
    const createCategoryBtn = document.getElementById('createCategory');
    const buttonAddCategory = document.getElementById('buttonAddCategory');
    const exitAddCategory = document.getElementById('exitAddCategory');
    const type = document.getElementById('type');
    const category = document.getElementById('category');
  
    if (colorPicker && colorHex) {
        colorPicker.addEventListener('input', function() {
            selectedColor = this.value;
            colorHex.textContent = selectedColor;
            const selectedIconEl = document.getElementById('selectedIcon');
            if (selectedIconEl) {
                selectedIconEl.style.color = selectedColor;
            }
        });
    }
  
    if (iconSelector && iconDropdown) {
        iconSelector.addEventListener('click', function() {
            iconDropdown.classList.toggle('hidden');
        });
  
        document.addEventListener('click', function(event) {
            if (!iconSelector.contains(event.target) && !iconDropdown.contains(event.target)) {
                iconDropdown.classList.add('hidden');
            }
        });
  
        const iconOptions = document.querySelectorAll('#iconDropdown .grid > div');
        iconOptions.forEach(option => {
            option.addEventListener('click', function() {
                iconOptions.forEach(opt => {
                    opt.classList.remove('bg-gray-300');
                    opt.classList.add('hover:bg-gray-400');
                });
  
                this.classList.add('bg-gray-300');
                selectedIcon = this.getAttribute('data-icon');
  
                const selectedIconEl = document.getElementById('selectedIcon');
                const selectedIconText = document.getElementById('selectedIconText');
                if (selectedIconEl && selectedIconText) {
                    selectedIconEl.className = `fas ${selectedIcon} mr-2`;
                    selectedIconEl.style.color = selectedColor;
                    selectedIconText.textContent = selectedIcon;
                }
  
                iconDropdown.classList.add('hidden');
            });
        });
    }
  
    if (createCategoryBtn) {
        createCategoryBtn.addEventListener('click', function() {
            const categoryName = document.getElementById('categoryName')?.value.trim();
            const categoryType = document.getElementById('categoryType')?.value;
    
            if (!categoryName) {
                alert('Por favor, digite um nome para a categoria.');
                return;
            }
    
            const generateId = () => `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
            const categoryData = {
                id: generateId(),
                name: categoryName,
                type: categoryType,
                color: selectedColor,
                icon: selectedIcon
            };
    
            const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
            listCategory.push(categoryData);
            localStorage.setItem('listCategory', JSON.stringify(listCategory));
            
            dataCategory();
            alert('Categoria criada com sucesso!');
            location.reload();
        });
    }
  
    if (buttonAddCategory) {
        buttonAddCategory.addEventListener('click', function() {
            const modalCategory = document.getElementById('showAddCategoryModal');
            if (modalCategory) {
                modalCategory.classList.remove('hidden');
                modalCategory.classList.add('flex');
            }
        });
    }
  
    if (exitAddCategory) {
        exitAddCategory.addEventListener('click', function() {
            const modalCategory = document.getElementById('showAddCategoryModal');
            if (modalCategory) {
                modalCategory.classList.remove('flex');
                modalCategory.classList.add('hidden');
            }
        });
    }
  
    dataCategory();
    dataCategoryShowUser();

    if (category) {
        const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
        const selectedCategoryId = category.value; 
        console.log(listCategory)
        const selectedCategory = listCategory.find(cat => cat.id === selectedCategoryId);
        
        if (selectedCategory && type) {
            type.innerHTML = `<p>${selectedCategory.type}</p>`;
        }
    }

    category.addEventListener('change', () => {
        const listCategory = JSON.parse(localStorage.getItem('listCategory'));
        const selectedType = category.value;
        const filteredCategories = listCategory.filter(cat => cat.id === selectedType);
        if (filteredCategories.length > 0) {
            type.innerHTML = `<p>${filteredCategories[0].type}</p>`;
        }
    });
});
  
const dataCategory = () => {
    const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
    const htmlCategory = document.getElementById('showCategory');
  
    if (!htmlCategory) return;
  
    htmlCategory.innerHTML = listCategory.map(cat => `
        <div class="flex items-center gap-5 mb-5 max-5xl:gap-3">
            <div class="flex items-center justify-center w-13 h-13 rounded-full" style="background-color: ${cat.color};">
                <i class="fas ${cat.icon} text-[28px] text-[#eceff4]"></i>
            </div>
            <p class="text-[26px] font-semibold max-5xl:text-[22px] truncate max-w-[179px]">${cat.name}</p>
        </div>
    `).join('');

    dataCategoryShowUser();
};

const dataCategoryShowUser = () => {
    const category = document.getElementById('category');
    if (category && type) {
        const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];

        category.innerHTML = listCategory.map(value => `
            <option value="${value.id}">${value.name}</option>
        `).join('');
    }
};

