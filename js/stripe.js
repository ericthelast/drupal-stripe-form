(function($) {
  $(function() {
    Stripe.setPublishableKey(Drupal.settings.stripeform.pubkey);
  });
  Drupal.behaviors.stripeform = {
    attach: function(context, settings) {
      $("#" + settings.stripeform.form_selector, context).submit(function(e) {
        e.preventDefault();
        var $form = $(this);
        var $obj;
        var $submitBtn = $("#edit-submit", context);
        settings.stripeform.submitBtnText = $submitBtn.val();
        try {
          var $ccnum = $(':input[data-stripe="number"]', $form);
          var $exp_month = $(':input[data-stripe="exp-month"]', $form);
          var $exp_year = $(':input[data-stripe="exp-year"]', $form);
          var $cvc = $(':input[data-stripe="cvc"]', $form);
          if(!Stripe.card.validateCardNumber($(':input[data-stripe="number"]', $form).val())) {
            $obj = $ccnum;
            throw "Invalid credit card number";
          }
          if(!Stripe.card.validateExpiry($exp_month.val(), $exp_year.val())) {
            $obj = $exp_month;
            throw "Invalid expiration month/year";
          }
          if(!Stripe.card.validateCVC($cvc.val())) {
            $obj = $cvc;
            throw "Invalid CVC";
          }
        } catch(err) {
          $.each([$ccnum, $exp_month, $exp_year, $cvc], function(i, e) {
            e.addClass('error');
          });
          $obj.parents('div.control-group').toggleClass('error');
          reportError(err, $obj);
          return false;
        }
        $submitBtn.val('Please wait...').attr('disabled', true);
        Stripe.createToken($form, stripeResponseHandler);
        return false;
      });
    }
  }

  var stripeResponseHandler = function(status, response) {
    var $form = $("#" + Drupal.settings.stripeform.form_selector);
    if (response.error) {
      alert(response.error.message);
    } else {
      // token contains id, last4, and card type
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $('input[name=stripeToken]', $form).val(token);
      // and submit
      $form.get(0).submit();
    }
  };

  /**
   * Uses Bootstrap's popover to alert the user.
   */
  function reportError(msg, $el) {
    console.log([$el, msg]);
  }
}(jQuery));
