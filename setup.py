"""Minimal setup.py so scripts/ and backend/ are importable as packages."""

from setuptools import find_packages, setup

setup(
    name="lucid",
    version="0.1.0",
    description="LUCID — content literacy tool that scores short-form video manipulation",
    author="Lindsay Gross",
    packages=find_packages(include=["backend", "backend.*", "scripts", "scripts.*"]),
    python_requires=">=3.11",
)
