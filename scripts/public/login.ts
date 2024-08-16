import { FormHandler } from './form-handler.js';
import { TLoginPostData, TResponseStatus } from './types.js';

document.addEventListener('DOMContentLoaded', () => {
  // get the form element
  const form = document.getElementById('login-form') as HTMLFormElement;

  // response container is the div element inside the form that have id 'response-container', and must be inside the form element
  const responseContainer = form.querySelector(
    'div#response-container',
  ) as HTMLDivElement;

  // create new FormHandler instance
  const handler = new FormHandler<TResponseStatus<TLoginPostData>>(
    form,
    '/api/login',
  );

  // What happens when it is successful?
  handler.setOnSuccess((data) => {
    // set the response message
    responseContainer.innerText = `Success: ${data.message}`;

    // remove the error classes
    responseContainer.classList.remove(
      'bg-red-100',
      'text-red-800',
      'border-red-400',
      'mb-12',
    );

    // add the success classes
    responseContainer.classList.add(
      'bg-green-100',
      'text-green-800',
      'border-green-400',
      'mb-12',
    );

    // Reload to automatically redirect whatever it takes them to
    location.reload();
  });

  // What happens when it fails?
  handler.setOnFail((data) => {
    // set the response message
    responseContainer.innerText = `Error: ${data.message}`;

    // remove the success classes
    responseContainer.classList.remove(
      'bg-green-100',
      'text-green-800',
      'border-green-400',
      'mb-12',
    );

    // add the error classes
    responseContainer.classList.add(
      'bg-red-100',
      'text-red-800',
      'border-red-400',
      'mb-12',
    );
  });

  // What happens when it is loading?
  handler.setLoading((form) => {
    // disable the form
    form.querySelectorAll('input, button').forEach((el) => {
      el.setAttribute('disabled', 'disabled');
    });

    // disable navigates to the register page
    const registerLink = form.querySelector('a') as HTMLAnchorElement;
    registerLink.setAttribute('href', '#');
    registerLink.classList.add('hidden');

    // set the response message
    responseContainer.innerText = 'Loading...';

    // remove the success and error classes
    responseContainer.classList.remove(
      'bg-green-100',
      'text-green-800',
      'border-green-400',
      'bg-red-100',
      'text-red-800',
      'border-red-400',
    );

    // Add the loading classes
    responseContainer.classList.add(
      'bg-blue-100',
      'text-blue-800',
      'border-blue-400',
      'mb-12',
    );
  });

  // What happens when it is loaded?
  handler.setLoaded((form) => {
    // enable the form
    form.querySelectorAll('input, button').forEach((el) => {
      el.removeAttribute('disabled');
    });

    // enable navigates to the register page
    const registerLink = form.querySelector('a') as HTMLAnchorElement;
    registerLink.setAttribute('href', '/auth/login');
    registerLink.classList.remove('hidden');

    // remove the loading classes
    responseContainer.classList.remove(
      'bg-blue-100',
      'text-blue-800',
      'border-blue-400',
    );
  });

  // Ok, we are ready
  handler.set();
});
