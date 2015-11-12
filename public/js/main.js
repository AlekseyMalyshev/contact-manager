'use strict';

$(document).ready(init);

var $inRow;
var $sorted;
var $toDelete;
var fieldMap = [
  'name',
  'surname',
  'address',
  'zip',
  'phone',
  'city',
  'state'];

function init() {
  $('div.content').on('click', 'table.contacts td.editable', editField);
  $('div.content').on('click', 'table.contacts input', block);
  $('div.content').on('keydown', 'table.contacts input', keySave);
  $('body').on('keydown', keyCancel);

  $('div.content').on('click', 'table.contacts th>i', sortColumn);

  $('div.content').on('click', 'table.contacts i.fa-pencil-square-o', editContact);
  $('div.content').on('click', 'table.contacts i.fa-save', saveContact);
  $('div.content').on('click', 'table.contacts i.fa-trash-o', confirmDelete);

  $('div.content').on('click', 'table.contacts i.fa-plus-square-o', addContact);

  $('div.content').on('submit', 'form#new-contact', submitContact);
  $('div.content').on('cancel', 'form#new-contact', confirmContact);
}

function sortColumn(event) {
  if ($sorted && $sorted[0] !== $(event.target)[0]) {
    $sorted.removeClass('fa-sort-desc');
    $sorted.removeClass('fa-sort-asc');
    $sorted.addClass('fa-unsorted');
  }
  $sorted = $(event.target);

  if ($sorted.hasClass('fa-sort-desc')) {
    $sorted.removeClass('fa-sort-desc');
    $sorted.addClass('fa-sort-asc');
    sortRows($sorted.parent().index(), true);
  }
  else {
    $sorted.removeClass('fa-unsorted');
    $sorted.removeClass('fa-sort-asc');
    $sorted.addClass('fa-sort-desc');
    sortRows($sorted.parent().index(), false);
  }
}

function sortRows(index, desc) {
  ++index;
  var selector = 'td:nth-child(' + index + ')';
  var $rows = $('table.contacts>tbody>tr').get();

  $rows.sort(function(a, b) {
    var A = $(a).children(selector).text();
    var B = $(b).children(selector).text();
    if (A < B) {
      return desc ? 1 : -1;
    }
    else if (A > B) {
      return desc ? -1 : 1;
    }
    else {
      return 0;
    }
  });

  $('table.contacts>tbody').append($rows);
}

function block(event) {
  event.stopPropagation();
}

function keySave(event) {
  if (event.keyCode === 13) {
    event.stopPropagation();
    saveEdit();
  }
}

function keyCancel(event) {
  if ($inRow && event.keyCode === 27) {
    event.stopPropagation();
    cancelEdit();
  }
}

function editContact(event) {
  event.stopPropagation();

  var $tr = $(event.target).parents('tr');
  finishEdit($tr);
  $tr.children('td.editable').each(function() {
    edit($(this));
  });
  btnSave($(event.target));
}

function saveContact(event) {
  event.stopPropagation();

  saveEdit();
}

function confirmDelete(event) {
  event.stopPropagation();

  $toDelete = $(event.target).parents('tr');

  $('h4.modal-title').text('You are about to delete a contact. This operation can not be undone.');
  $('button.confirm').one('click', deleteContact);
  $('div#confirm').modal();
}

function deleteContact(event) {
  $.ajax({
    method: 'DELETE',
    url: '/api/' + $toDelete.attr('id').substring(3),
    success: deleteSuccess,
    error: showError
  });
}

function showError(err) {
  console.error('aaaa');
  $('div#show-error').modal();
}

function deleteSuccess() {
  if (inEdit($toDelete)) {
    $inRow = undefined;
  }
  $toDelete.remove();
}

function editField(event) {
  event.stopPropagation();

  var $tr = $(event.target).parent();
  finishEdit($tr);
  edit($(event.target));
  btnSave($tr.find('i.fa-pencil-square-o'));
}

function edit($td) {
  var $editbox = $('<input class="editbox">');
  $editbox.val($td.text());
  $editbox.width($td.width());
  $editbox.height($td.height());

  var paddingTop = parseFloat($td.css('padding-top'));
  var paddingLeft = parseFloat($td.css('padding-left'));

  var pos = $td.position();
  $editbox.css('top', pos.top + paddingTop);
  $editbox.css('left', pos.left + paddingLeft);

  $td.append($editbox);
}

function inEdit($tr) {
  return $inRow && $tr && $inRow[0] === $tr[0];
}

function rowChanged($tr) {
  var changed = false;
  $tr.find('td.editable>input').each(function() {
    if ($(this).parent().text() !== $(this).val().trim()) {
      changed = true;
      return false;
    }
    else {
      return true;
    }
  });
  return changed;
}

function cancelEdit() {
  $inRow.find('input').remove();
  btnEdit($inRow.find('i.fa-save'));
}

function saveEdit() {
  var contact = {};
  contact.id = $inRow.attr('id').substring(3);

  $inRow.find('td.editable>input').each(function() {
    var $td = $(this).parent();
    var newVal = $(this).val().trim();
    if ($td.text() !== newVal) {
      contact[fieldMap[$td.index()]] = newVal;
      $td.text(newVal);
    }
    $(this).remove();
  });

  $.ajax({
    method: 'PUT',
    url: '/api',
    data: contact,
    success: confirmEdit,
    error: showError
  });
}

function confirmEdit() {
  btnEdit($inRow.find('i.fa-save'));
  $inRow = undefined;
}

function btnEdit($btn) {
  if ($btn) {
    $btn.addClass('fa-pencil-square-o');
    $btn.removeClass('fa-save');
  }
}

function btnSave($btn) {
  if ($btn) {
    $btn.addClass('fa-save');
    $btn.removeClass('fa-pencil-square-o');
  }
}

function finishEdit($tr) {
  if ($inRow && !inEdit($tr)) {
    if (rowChanged($inRow)) {
      $('h4.modal-title').text('You have unsaved changes. Do you want to save them?');
      $('button.confirm').one('click', saveEdit());
      $('#confirm').modal();
    }
    else {
      cancelEdit();
    }
  }

  $inRow = $tr;
}

function addContact() {
  $.ajax({
    method: 'GET',
    url: '/edit/',
    success: showForm,
    error: showError
  });
}

function showForm(html) {
  $('div.content').children().remove();
  $('div.content').append($.parseHTML(html));
}

function submitContact () {
  var contact = {};
  $('form#new-contact').find('input').each(function() {
    contact[$(this).attr('id')] = $(this).val();
  });

  $.ajax({
    method: 'POST',
    url: '/api',
    data: contact,
    success: confirmContact,
    error: showError
  });
  return false;
}

function confirmContact () {
    $.ajax({
      method: 'GET',
      url: '/contacts/',
      success: showContacts,
      error: showError
    });
}

function showContacts(html) {
  $('div.content').children().remove();
  $('div.content').append($.parseHTML(html));
}
