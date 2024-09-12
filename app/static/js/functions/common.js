const inputClearHelper = (input) => {
  if (!input) return;
  input.value = '';
  input.classList.remove('is-valid');
  input.classList.remove('is-invalid');
};

const selectClearHelper = function (select) {
  select.selectedIndex = 0;
  select.classList.remove('is-valid');
  select.classList.remove('is-invalid');
};

const validationHelper = function (field) {
  if (!field) return false;
  if (field.value) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    return true;
  } else {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    return false;
  }
};

const clearDict = (dict) => {
  for (var prop in dict) {
    if (dict.hasOwnProperty(prop)) delete dict[prop];
  }
};

const convertToDict = function (list) {
  let dict = {};
  for (let i = 0; i < list.length; i++) {
    dict[list[i].id] = list[i].name;
  }
  return dict;
};

const docGetElement = function (id) {
  return document.getElementById(id);
};

function SearchFilterList(container, searchValue) {
  searchValue = searchValue.toLowerCase();
  const childrens = container.children;
  let applyFilter = false;
  if (searchValue.length > 0) applyFilter = true;
  for (let i = 0; i < childrens.length; i++) {
    if (applyFilter && childrens[i].innerHTML.toLowerCase().indexOf(searchValue) < 0) {
      childrens[i].classList.add('d-none');
    } else {
      childrens[i].classList.remove('d-none');
    }
  }
}
