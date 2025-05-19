/**
 * Điền dữ liệu vào form
 * @param {string} formData - Chuỗi dữ liệu dạng data[0]|data[1]|...
 * @param {string} formType - Loại form ("fillForm", "addPassword", "fillFormBank")
 * @returns {Object} Kết quả của việc điền form
 */
export const fillForm = async (formData, formType) => {
  try {
    // Tạo mã bookmarklet
    let script = "";
    const data = formData.split("|");

    switch (formType) {
      case "fillForm":
        // Mã điền form đăng ký
        script = `
            const data = ${JSON.stringify(data)};
            
            async function typeText(element, text) {
              if (!element) return;
              element.value = "";
              for (let i = 0; i < text.length; i++) {
                element.value += text[i];
                element.dispatchEvent(new Event('input', {bubbles:true}));
                element.dispatchEvent(new Event('change', {bubbles:true}));
                await new Promise(resolve => setTimeout(resolve, 30));
              }
            }
  
            // Form Hi88 style
            (async function() {
              await typeText(document.querySelector("input[formcontrolname='city']"), data[3]);
              await typeText(document.querySelector("input[formcontrolname='account']"), data[4]);
              await typeText(document.querySelector("input[formcontrolname='password']"), data[5]);
              await typeText(document.querySelector("input[formcontrolname='confirmPassword']"), data[5]);
              await typeText(document.querySelector("input[formcontrolname='name']"), data[0]);
              await typeText(document.querySelector("input[formcontrolname='mobile']"), data[7]);
              await typeText(document.querySelector("input[formcontrolname='email']"), data[8]);
              await typeText(document.querySelector("input[formcontrolname='moneyPassword']"), data[6]);
              
              // For alternative selectors
              await typeText(document.querySelector("input[ng-model='$ctrl.user.account.value']"), data[4]); 
              await typeText(document.querySelector("input[ng-model='$ctrl.user.password.value']"), data[5]); 
              await typeText(document.querySelector("input[ng-model='$ctrl.user.confirmPassword.value']"), data[5]); 
              await typeText(document.querySelector("input[ng-model='$ctrl.user.name.value']"), data[0]);  
              await typeText(document.querySelector("input[ng-model='$ctrl.user.mobile.value']"), data[7]); 
              await typeText(document.querySelector("input[ng-model='$ctrl.user.email.value']"), data[8]); 
              await typeText(document.querySelector("input[ng-model='$ctrl.user.moneyPassword.value']"), data[6]); 
              await typeText(document.querySelector("input[ng-model='$ctrl.user.birthday.value']"), data[9]);
            })();
          `;
        break;

      case "addPassword":
        // Mã điền mật khẩu rút tiền
        script = `
            const data = ${JSON.stringify(data)};
            const password = data[6];
            
            function setValue(element, value) {
              if (!element) return;
              element.removeAttribute("disabled"); 
              element.removeAttribute("readonly"); 
              element.value = value;
              element.dispatchEvent(new Event('input', {bubbles:true}));
              element.dispatchEvent(new Event('change', {bubbles:true}));
            }
            
            // Trường mật khẩu trên điện thoại
            const newPasswordFieldMobile = document.querySelector('input[formcontrolname="newPassword"]');
            const confirmPasswordFieldMobile = document.querySelector('input[formcontrolname="confirm"]');
  
            // Trường mật khẩu trên PC
            const newPasswordFieldPC = document.querySelector('input[ng-model="$ctrl.viewModel.moneyPasswordForm.newPassword.value"]');
            const confirmPasswordFieldPC = document.querySelector('input[ng-model="$ctrl.viewModel.moneyPasswordForm.confirmPassword.value"]');
  
            // Gán mật khẩu
            setValue(newPasswordFieldMobile, password);
            setValue(confirmPasswordFieldMobile, password);
            setValue(newPasswordFieldPC, password);
            setValue(confirmPasswordFieldPC, password);
          `;
        break;

      case "fillFormBank":
        // Mã điền thông tin ngân hàng
        script = `
            const data = ${JSON.stringify(data)};
            
            function typeText(element, text, callback) {
              if (!element) {
                if (callback) callback();
                return;
              }
              
              element.removeAttribute("disabled"); 
              element.removeAttribute("readonly"); 
              element.value = "";
              let index = 0;
  
              function inputChar() {
                  if (index < text.length) {
                      element.value += text[index];
                      element.dispatchEvent(new Event('input', { bubbles: true }));
                      element.dispatchEvent(new Event('change', { bubbles: true }));
                      setTimeout(() => inputChar(++index), 30);
                  } else if (callback) {
                      callback();
                  }
              }
              inputChar();
            }
  
            // Điền dữ liệu trên điện thoại
            let cityInputMobile = document.querySelector("input[formcontrolname='city'], input[ng-model='$ctrl.user.city.value']");
            let accountInputMobile = document.querySelector("input[formcontrolname='account'], input[ng-model='$ctrl.user.account.value']");
  
            // Điền dữ liệu trên PC
            let cityInputPC = document.querySelector("input[ng-model='$ctrl.viewModel.bankAccountForm.city.value']");
            let accountInputPC = document.querySelector("input[ng-model='$ctrl.viewModel.bankAccountForm.account.value']");
  
            typeText(cityInputMobile || cityInputPC, data[3], () => {
                typeText(accountInputMobile || accountInputPC, data[1]);
            });
          `;
        break;

      default:
        return { success: false, message: "Loại form không hợp lệ" };
    }

    // Tạo một iframe và chạy script trong đó (chỉ cho demo)
    // Trong thực tế, bạn sẽ cần sử dụng bookmarklet hoặc extension
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    setTimeout(() => {
      try {
        iframe.contentWindow.eval(script);
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message };
      } finally {
        document.body.removeChild(iframe);
      }
    }, 100);

    return {
      success: true,
      message:
        "Đã tạo mã bookmarklet - hãy sao chép và sử dụng trên trang web cần điền form",
    };
  } catch (error) {
    console.error("Lỗi khi điền form:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Tạo bookmarklet cho việc tự động điền form
 * @param {string} formData - Chuỗi dữ liệu dạng data[0]|data[1]|...
 * @param {string} formType - Loại form ("fillForm", "addPassword", "fillFormBank")
 * @returns {string} Mã bookmarklet
 */
export const createBookmarklet = (formData, formType) => {
  const scripts = {
    fillForm: `
        javascript:(function(){
          const data = "${formData}".split('|');
          
          async function typeText(element, text) {
            if (!element) return;
            element.value = "";
            for (let i = 0; i < text.length; i++) {
              element.value += text[i];
              element.dispatchEvent(new Event('input', {bubbles:true}));
              element.dispatchEvent(new Event('change', {bubbles:true}));
              await new Promise(resolve => setTimeout(resolve, 30));
            }
          }
  
          (async function() {
            await typeText(document.querySelector("input[formcontrolname='city']"), data[3]);
            await typeText(document.querySelector("input[formcontrolname='account']"), data[4]);
            await typeText(document.querySelector("input[formcontrolname='password']"), data[5]);
            await typeText(document.querySelector("input[formcontrolname='confirmPassword']"), data[5]);
            await typeText(document.querySelector("input[formcontrolname='name']"), data[0]);
            await typeText(document.querySelector("input[formcontrolname='mobile']"), data[7]);
            await typeText(document.querySelector("input[formcontrolname='email']"), data[8]);
            await typeText(document.querySelector("input[formcontrolname='moneyPassword']"), data[6]);
            
            // Alternative selectors
            await typeText(document.querySelector("input[ng-model='$ctrl.user.account.value']"), data[4]); 
            await typeText(document.querySelector("input[ng-model='$ctrl.user.password.value']"), data[5]); 
            await typeText(document.querySelector("input[ng-model='$ctrl.user.confirmPassword.value']"), data[5]); 
            await typeText(document.querySelector("input[ng-model='$ctrl.user.name.value']"), data[0]);  
            await typeText(document.querySelector("input[ng-model='$ctrl.user.mobile.value']"), data[7]); 
            await typeText(document.querySelector("input[ng-model='$ctrl.user.email.value']"), data[8]); 
            await typeText(document.querySelector("input[ng-model='$ctrl.user.moneyPassword.value']"), data[6]); 
          })();
        })();
      `,
    addPassword: `
        javascript:(function(){
          const data = "${formData}".split('|');
          const password = data[6];
          
          function setValue(element, value) {
            if (!element) return;
            element.removeAttribute("disabled"); 
            element.removeAttribute("readonly"); 
            element.value = value;
            element.dispatchEvent(new Event('input', {bubbles:true}));
            element.dispatchEvent(new Event('change', {bubbles:true}));
          }
          
          // Trường mật khẩu
          const newPasswordFieldMobile = document.querySelector('input[formcontrolname="newPassword"]');
          const confirmPasswordFieldMobile = document.querySelector('input[formcontrolname="confirm"]');
          const newPasswordFieldPC = document.querySelector('input[ng-model="$ctrl.viewModel.moneyPasswordForm.newPassword.value"]');
          const confirmPasswordFieldPC = document.querySelector('input[ng-model="$ctrl.viewModel.moneyPasswordForm.confirmPassword.value"]');
  
          setValue(newPasswordFieldMobile, password);
          setValue(confirmPasswordFieldMobile, password);
          setValue(newPasswordFieldPC, password);
          setValue(confirmPasswordFieldPC, password);
        })();
      `,
    fillFormBank: `
        javascript:(function(){
          const data = "${formData}".split('|');
          
          function typeText(element, text, callback) {
            if (!element) {
              if (callback) callback();
              return;
            }
            
            element.removeAttribute("disabled"); 
            element.removeAttribute("readonly"); 
            element.value = "";
            let index = 0;
  
            function inputChar() {
              if (index < text.length) {
                element.value += text[index];
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => inputChar(++index), 30);
              } else if (callback) {
                callback();
              }
            }
            inputChar();
          }
  
          let cityInputMobile = document.querySelector("input[formcontrolname='city'], input[ng-model='$ctrl.user.city.value']");
          let accountInputMobile = document.querySelector("input[formcontrolname='account'], input[ng-model='$ctrl.user.account.value']");
          let cityInputPC = document.querySelector("input[ng-model='$ctrl.viewModel.bankAccountForm.city.value']");
          let accountInputPC = document.querySelector("input[ng-model='$ctrl.viewModel.bankAccountForm.account.value']");
  
          typeText(cityInputMobile || cityInputPC, data[3], () => {
            typeText(accountInputMobile || accountInputPC, data[1]);
          });
        })();
      `,
  };

  return scripts[formType]?.replace(/\s+/g, " ").trim() || "";
};
