function securityWarning(){
    if (localeType === 'ru'){
        console.log("%cСтоп-стоп-стоп!\n", "color: #219ebc; font-size: 35px;");
        console.log('%cЕсли вас попросили скопировать/вставить что-то сюда, 11 шансов из 10, что вы жертва мошенников.\n', 'font-size: 18px;');
        console.log('%cВвод сюда информации может дать мошенникам доступ к вашей учётной записи.\n', 'color: red; font-size: 18px;');
        console.log('\n\n');
    }
    else{
        console.log("%cStop-stop-stop!\n", "color: #219ebc; font-size: 35px;");
        console.log('%cIf you were asked to copy/paste something here, 11 out of 10 chances are that you are a victim of scammers.\n', 'font-size: 18px;');
        console.log('%cEntering information here may give scammers access to your account.\n', 'color: red; font-size: 18px;');
        console.log('\n\n');
    }
}
securityWarning();
