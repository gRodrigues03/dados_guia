import streamlit as st
a = st.components.v2.component('dados_guia.dados_guia',js='index.mjs',html='<div id=t-ddg>', isolate_styles=False, version=4)
def dados_guia(dados: dict, placa=None, passageiro=None):
    a(data={**dados,'placa': placa,'passageiro':passageiro,'mode':st.session_state.theme_pref},key='b4r4')