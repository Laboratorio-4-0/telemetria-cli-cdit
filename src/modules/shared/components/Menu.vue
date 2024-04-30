<template>
    <div class="menu_contenedor">
        <div class="menu_lateral"></div>
        <div class="menu_encabezado_izquierdo">
            <div class="">
                <div class="menu">
                    <span class="item">
                        Laboratorio de Industria 4.0
                    </span>
                </div>
            </div>
        </div>
        <div class="menu_encabezado_derecho">
            <div class="">
                <div class="menu">
                    <img src="../../assets/images/login/separador.png" alt="Avatar de usuario"  height="24px">
                    <span class="item">
                        &nbsp; &nbsp;
                        Jesus Vilchis
                        &nbsp; &nbsp;
                    </span>
                    <img src="../../assets/images/login/user.png" alt="Avatar de usuario" width="26px" height="26px">
                </div>
            </div>
        </div>
    </div>

</template>

<style lang="scss" scoped>

.menu_contenedor {
    display: flex;
}

.menu_encabezado_izquierdo{
    background-color: #75293D;
    height: 40px;
    display: flex;
    align-items: center;
    width: 50%;
    padding-left: 89px;
    width: calc(100% - 140px); /* Resta el ancho de la barra lateral al ancho total */
}

.menu_encabezado_derecho {
    background-color: #75293D;
    height: 40px;
    display: flex;
    align-items: center;
    width: 50%;
    padding-right: 89px;
    justify-content: flex-end;
}

.menu {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.item {
    color: #fff;
    font-family: "Ubuntu", Arial, sans-serif;
    
}

.menu_lateral {
    background-color: #dcdcdc;
    width: 150px; /* Ajusta el ancho de la barra lateral */
    padding: 20px; /* Ajusta el espaciado interno de la barra lateral */
    display: flex;
    align-items: center;
}

</style>