/* =========================================
   CONTACT FORM API
   Sends #contactForm to POST /api/contact
========================================= */

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    var statusBox = document.getElementById('formStatus');

    if (!form || !statusBox) {
        console.error('Contact form or status box not found.');
        return;
    }

    var submitButton = form.querySelector('.form-submit');
    var buttonIcon = submitButton
        ? submitButton.querySelector('i')
        : null;

    var iconClass = buttonIcon
        ? buttonIcon.className
        : '';

    function showStatus(message, type) {
        statusBox.textContent = message;
        statusBox.className = 'form-status ' + type;
    }

    function setLoading(isLoading) {
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.classList.toggle(
                'is-loading',
                isLoading
            );
        }

        if (buttonIcon) {
            buttonIcon.className = isLoading
                ? 'fa-solid fa-spinner'
                : iconClass;
        }
    }

    async function submitContactForm(formData) {
        var response;

        try {
            response = await fetch(
                window.API_BASE + '/api/contact',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(formData)
                }
            );
        } catch (error) {
            console.error(
                'FETCH ERROR:',
                error
            );

            throw new Error(
                'Could not reach the server. Please try again.'
            );
        }

        var responseText = await response.text();

        console.log(
            'CONTACT API STATUS:',
            response.status
        );

        console.log(
            'CONTACT API RAW RESPONSE:',
            responseText
        );

        var result = null;

        if (responseText) {
            try {
                result = JSON.parse(responseText);
            } catch (error) {
                console.error(
                    'INVALID JSON FROM SERVER:',
                    responseText
                );

                throw new Error(
                    'The server returned an invalid response.'
                );
            }
        }

        if (!response.ok) {
            console.error(
                'CONTACT API ERROR:',
                result
            );

            throw new Error(
                result && result.message
                    ? result.message
                    : 'Server error: ' + response.status
            );
        }

        if (!result) {
            throw new Error(
                'The server returned an empty response.'
            );
        }

        if (result.success !== true) {
            throw new Error(
                result.message ||
                'Form submission failed.'
            );
        }

        return result;
    }

    form.addEventListener(
        'submit',
        async function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            var formData = {
                name: form.elements.name.value.trim(),

                email: form.elements.email.value.trim(),

                service: form.elements.service.value.trim(),

                subject: form.elements.subject.value.trim(),

                message: form.elements.message.value.trim(),

                consent: form.elements.consent.checked
            };

            console.log(
                'CONTACT FORM DATA:',
                formData
            );

            setLoading(true);

            showStatus('', '');

            try {
                var result =
                    await submitContactForm(
                        formData
                    );

                console.log(
                    'CONTACT FORM SUCCESS:',
                    result
                );

                form.reset();

                showStatus(
                    'Thank you! Your message has been sent. We will reply within 24 hours.',
                    'success'
                );
            } catch (error) {
                console.error(
                    'CONTACT FORM ERROR:',
                    error
                );

                showStatus(
                    error.message ||
                    'Something went wrong. Please try again.',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        }
    );
});