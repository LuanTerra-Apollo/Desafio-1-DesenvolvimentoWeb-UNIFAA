function aplicarMascaraParaRealComPrefixo(valor){
    if(isNaN(valor)){
        return 0;
    }

    return Number(valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}