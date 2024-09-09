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
const bs_select_new = (
    id,
    selectLabel,
    inputLabel,
    inputType,
    options,
    required = false,
    errorSelectText = null,
    errorInputText = null
) => {
    let div = document.createElement('div');
    div.id = id;
    let selectDiv = bs_select_new_select(id, selectLabel, required, options, errorSelectText);
    let inputDiv = bs_select_new_input(id, inputLabel, inputType, errorInputText);
    div.appendChild(selectDiv);
    div.appendChild(inputDiv);
    bs_select_new_event_change(selectDiv, inputDiv);
    bs_select_new_event_input(selectDiv, inputDiv);
    return div;
};

const bs_select_new_select = (id, labelText, required, options, errorSelectText) => {
    let selectId = id + '-select';
    let newOptionValue = id + '-new';

    let div = document.createElement('div');
    div.classList.add('mb-3');

    let label = document.createElement('label');
    label.htmlFor = selectId;
    label.classList.add('form-label');
    label.innerText = labelText;

    let select = document.createElement('select');
    select.classList.add('form-select');
    select.id = selectId;
    if (required) select.required = true;

    select.appendChild(bs_select_new_option('', 'Выбрать из списка...', true, true));
    for (let i = 0; i < options.length; i++) {
        select.appendChild(bs_select_new_option(options[i].id, options[i].name));
    }
    select.appendChild(bs_select_new_option(newOptionValue, 'Создать новую запись...'));

    div.appendChild(label);
    div.appendChild(select);

    if (errorSelectText) {
        let errorDiv = document.createElement('div');
        errorDiv.classList.add('invalid-feedback');
        errorDiv.innerText = errorSelectText;
        div.appendChild(errorDiv);
    }
    return div;
};

const bs_select_new_option = (value, text, disabled = false, selected = false) => {
    let option = document.createElement('option');
    option.value = value;
    option.innerText = text;
    if (disabled) option.disabled = true;
    if (selected) option.selected = true;
    return option;
};

const bs_select_new_input = (id, labelText, type, errorInputText) => {
    let inputDivId = id + '-field';
    let inputId = id + '-input';

    let div = document.createElement('div');
    div.id = inputDivId;
    div.classList.add('mb-3');
    div.classList.add('d-none');

    let label = document.createElement('label');
    label.htmlFor = inputId;
    label.classList.add('form-label');
    label.innerText = labelText;
    if (labelText === '') label.classList.add('d-none');

    let input = document.createElement('input');
    input.id = inputId;
    input.type = type;
    input.classList.add('form-control');
    input.required = true;

    div.appendChild(label);
    div.appendChild(input);

    if (errorInputText) {
        let errorDiv = document.createElement('div');
        errorDiv.classList.add('invalid-feedback');
        errorDiv.innerText = errorInputText;
        div.appendChild(errorDiv);
    }
    return div;
};

const bs_select_new_event_change = (selectDiv, inputDiv) => {
    selectDiv.addEventListener('change', (evt) => {
        if (evt.target.selectedIndex === evt.target.options.length - 1) {
            inputDiv.classList.remove('d-none');
            inputDiv.childNodes[1].focus();
        } else {
            inputDiv.classList.add('d-none');
        }
    });
};

const bs_select_new_event_input = (selectDiv, inputDiv) => {
    let input = inputDiv.childNodes[1];
    let options = selectDiv.childNodes[1].options;
    input.addEventListener('input', (evt) => {
        let value = evt.target.value.toLowerCase();
        if (value === '') return;
        for (let i = 1; i < options.length - 1; i++) {
            const option = options[i].innerText.toLowerCase();
            if (option.indexOf(value) > -1 && option.length === value.length) {
                input.classList.add('is-invalid');
                return;
            }
        }
        input.classList.remove('is-invalid');
    });
};
