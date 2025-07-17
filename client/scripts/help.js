$(document).ready(function () {
  // When an FAQ-link is clicked
  $('.faq-link').on('click', function (e) {
    e.preventDefault(); 

    const questionId = $(this).data('view');  // Collect the data-view attribute from the clicked link
    const $answerDiv = $('#' + questionId + '-answer');  // Collect the div for the answer based on id

    // Hide and show the answer 
    $answerDiv.toggle(); 
  });
});
