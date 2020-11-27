#!/usr/bin/env python

from setuptools import setup

setup(name='climate_eyes',
    version='1.0',
    author='Daniel Lovette',
    author_email='dfunklove@gmail.com',
    url='https://github.com/dfunklove/climate_eyes',
    license='LICENSE.txt',
    description='Provide an overview of climate trends via a Flask REST app and a web client.',
    long_description=open('README.md').read(),
    packages=['climate_eyes'],
    install_requires=['flask', 'requests']
    )
