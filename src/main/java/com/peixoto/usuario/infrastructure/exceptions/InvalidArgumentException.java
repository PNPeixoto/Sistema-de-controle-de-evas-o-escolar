package com.peixoto.usuario.infrastructure.exceptions;

public class InvalidArgumentException extends RuntimeException {
    public InvalidArgumentException(String mensagem) { super(mensagem); }
    public InvalidArgumentException(String mensagem, Throwable t) { super(mensagem, t); }
}
