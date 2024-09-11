/**
 * Return select with input for new option
 * @param {String} id id for new div
 * @param {String} selectLabel label for select
 * @param {String} inputLabel label for input
 * @param {String} inputType type of input
 * @param {JSON} options dict of options
 * @param {boolean} [required=false] select is required
 * @param {String} [errorSelectText = null] error text for select
 * @param {String} [errorInputText=null] error text for input
 * @return {HTMLDivElement} div with select
 */
const bs_select_new = function (
  id,
  selectLabel,
  inputLabel,
  inputType,
  options,
  required = false,
  errorSelectText = null,
  errorInputText = null
) {
  let div = document.createElement('div');
  div.id = id;
  let selectDiv = new_select();
  let inputDiv = new_input();
  div.appendChild(selectDiv);
  div.appendChild(inputDiv);
  assign_change_event();
  assign_input_event();

  function new_select() {
    let selectId = id + '-select';
    let newOptionValue = id + '-new';

    let div = document.createElement('div');
    div.classList.add('mb-3');

    let label = document.createElement('label');
    label.htmlFor = selectId;
    label.classList.add('form-label');
    label.innerText = selectLabel;

    let select = document.createElement('select');
    select.classList.add('form-select');
    select.id = selectId;
    if (required) select.required = true;

    select.appendChild(new_option('', 'Выбрать из списка...', true, true));
    for (let i = 0; i < options.length; i++) {
      select.appendChild(new_option(options[i].id, options[i].name));
    }
    select.appendChild(new_option(newOptionValue, 'Создать новую запись...'));

    div.appendChild(label);
    div.appendChild(select);

    if (errorSelectText) {
      let errorDiv = document.createElement('div');
      errorDiv.id = id + '-select-error';
      errorDiv.classList.add('invalid-feedback');
      errorDiv.innerText = errorSelectText;
      div.appendChild(errorDiv);
    }
    return div;
  }

  function new_option(value, text, disabled = false, selected = false) {
    let option = document.createElement('option');
    option.value = value;
    option.innerText = text;
    if (disabled) option.disabled = true;
    if (selected) option.selected = true;
    return option;
  }

  function new_input() {
    let inputDivId = id + '-field';
    let inputId = id + '-input';

    let div = document.createElement('div');
    div.id = inputDivId;
    div.classList.add('mb-3');
    div.classList.add('d-none');

    let label = document.createElement('label');
    label.htmlFor = inputId;
    label.classList.add('form-label');
    label.innerText = inputLabel;
    if (inputLabel === '') label.classList.add('d-none');

    let input = document.createElement('input');
    input.id = inputId;
    input.type = inputType;
    input.classList.add('form-control');
    input.required = true;

    div.appendChild(label);
    div.appendChild(input);

    if (errorSelectText) {
      let errorDiv = document.createElement('div');
      errorDiv.id = id + '-input-error';
      errorDiv.classList.add('invalid-feedback');
      errorDiv.innerText = errorSelectText;
      div.appendChild(errorDiv);
    }
    return div;
  }

  function assign_change_event() {
    selectDiv.addEventListener('change', (evt) => {
      if (evt.target.selectedIndex === evt.target.options.length - 1) {
        inputDiv.classList.remove('d-none');
        inputDiv.childNodes[1].focus();
      } else {
        inputDiv.classList.add('d-none');
      }
    });
  }

  function assign_input_event() {
    let input = inputDiv.childNodes[1];
    let options = selectDiv.childNodes[1].options;
    input.addEventListener('input', (evt) => {
      let value = evt.target.value.toLowerCase();
      if (!value) {
        input.classList.add('is-invalid');
        return;
      }
      for (let i = 1; i < options.length - 1; i++) {
        const option = options[i].innerText.toLowerCase();
        if (option.indexOf(value) > -1 && option.length === value.length) {
          document.getElementById(id + '-input-error').innerText = errorInputText;
          input.classList.add('is-invalid');
          return;
        }
      }
      document.getElementById(id + '-input-error').innerText = errorSelectText;
      input.classList.remove('is-invalid');
    });
  }

  return div;
};
